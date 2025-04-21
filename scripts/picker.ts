import fs from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'
import prompts from 'prompts'

async function startPicker(args: string[]) {
    const presentationsDir = new URL('../presentations', import.meta.url)

    const folders = (await fs.readdir(presentationsDir, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .sort((a, b) => a.localeCompare(b))

    if (folders.length === 0) {
        console.error('No presentations found in presentations/')
        process.exit(1)
    }

    const result = args.includes('-y')
        ? { folder: folders[0] }
        : await prompts([
            {
                type: 'select',
                name: 'folder',
                message: 'Pick a presentation',
                choices: folders.map(folder => ({ title: folder, value: folder })),
            },
        ])

    args = args.filter(arg => arg !== '-y')

    if (result.folder) {
        const slidesPath = fileURLToPath(
            new URL(`../presentations/${result.folder}/slides.md`, import.meta.url)
        )
        const presDir = new URL(
            `../presentations/${result.folder}`,
            import.meta.url
        )

        // Run pnpm in the directory of the selected presentation
        await execa('pnpm', ['run', ...args], {
            cwd: presDir,
            stdio: 'inherit',
        })
    }
}

await startPicker(process.argv.slice(2))
