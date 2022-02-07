import fs from 'fs';
import path from 'path';
import { rollup, watch } from 'rollup';

const watchMode = process.argv.includes('--watch');
const external = [
    'fs',
    'path',
    'assert',
    'test-console',
    'ansi-colors',
    'clap'
];

function removeCreateRequire(id) {
    return fs.readFileSync(id, 'utf8')
        .replace(/import .+ from 'module';/, '')
        .replace(/const require = .+;/, '');
}

function replaceContent(map) {
    return {
        name: 'file-content-replacement',
        load(id) {
            const key = path.relative('', id);

            if (map.hasOwnProperty(key)) {
                return map[key](id);
            }
        }
    };
}

function readDir(dir) {
    return fs.readdirSync(dir)
        .filter(fn => fn.endsWith('.js'))
        .map(fn => `${dir}/${fn}`);
}

async function build(outputDir, ...entryPoints) {
    const startTime = Date.now();

    const inputOptions = {
        external,
        input: entryPoints,
        plugins: [
            replaceContent({
                'lib/version.js': removeCreateRequire
            })
        ]
    };
    const outputOptions = {
        dir: outputDir,
        entryFileNames: '[name].cjs',
        format: 'cjs',
        exports: 'auto',
        preserveModules: true,
        interop: false,
        esModule: false,
        generatedCode: {
            constBindings: true
        }
    };

    if (!watchMode) {
        console.log();
        console.log(`Convert ESM to CommonJS (output: ${outputDir})`);

        const bundle = await rollup(inputOptions);
        await bundle.write(outputOptions);
        await bundle.close();

        console.log(`Done in ${Date.now() - startTime}ms`);
    } else {
        const watcher = watch({
            ...inputOptions,
            output: outputOptions
        });

        watcher.on('event', ({ code, duration }) => {
            if (code === 'BUNDLE_END') {
                console.log(`Convert ESM to CommonJS into "${outputDir}" done in ${duration}ms`);
            }
        });
    }
}

async function buildAll() {
    await build('./cjs', 'lib/index.js');
    await build('./cjs-test', ...readDir('test'));
}

buildAll();
