import fs from 'fs/promises'
import path from 'path'

async function createFolder(folderName) {
    try {
        const dirPath = path.join(process.cwd(), folderName)
        await fs.mkdir(dirPath, { recursive: true })
        return dirPath
    } catch (error) {
        console.error(`Error creating directory: ${error}`)
    }
}

async function saveImageFile(filePath, arrayBuffer) {
    try {
        const buffer = Buffer.from(arrayBuffer)

        await fs.writeFile(filePath, buffer)
    } catch (error) {
        console.error(`Error writing image file to local machine: ${error}`)
    }
}

async function savePokemonStats(folderName, pokemonStatsObject) {
    const filePath = path.join(folderName, 'stats.txt')

    let content = ''
    for (const stat of pokemonStatsObject) {
        content += `${stat.stat.name}: ${stat.base_stat}\n`
    }

    try {
        await fs.writeFile(filePath, content, 'utf8')
    } catch (error) {
        console.error(`Error writing pokemon stats file: ${error}`)
    }
}

async function savePokemonSprites(folderName, pokemonSpritesObject) {
    for (const key in pokemonSpritesObject) {
        try {
            const spriteUrl = pokemonSpritesObject[key]
            if(spriteUrl && typeof spriteUrl === 'string') {
                const response = await fetch(spriteUrl)
                const arrayBuffer = await response.arrayBuffer()
                const filePath = path.join(folderName, `${key}.png`)
                await saveImageFile(filePath, arrayBuffer)
            }
        } catch (error) {
            console.error(`Error saving pokemon sprite: ${error}`)
        }
    }
}

async function savePokemonArtwork(folderName, pokemonArtworkObject) {
    for (const key in pokemonArtworkObject) {
        try {
            const artworkUrl = pokemonArtworkObject[key]
            if(artworkUrl && typeof artworkUrl === 'string') {
                const response = await fetch(artworkUrl)
                const arrayBuffer = await response.arrayBuffer()
                const filePath = path.join(folderName, `official_${key}.png`)
                await saveImageFile(filePath, arrayBuffer)
            }
        } catch (error) {
            console.error(`Error saving artwork: ${error}`)
        }
    }
}

function startDownloadMessage() {
    let message = "Downloading files, please wait"
    let count = 0
    const intervalId = setInterval(() => {
        process.stdout.write(`\r${' '.repeat(50)}\r`)
        process.stdout.write(`${message}${'.'.repeat(count % 4)}`)
        count++
    }, 500)

    return () => clearInterval(intervalId)
}

async function parseOptions(pokemonObject, optionsObject) {
    const folder = await createFolder(pokemonObject.name)
    const stopMessage = startDownloadMessage()

    try {
        for (const option of optionsObject.options) {
            if (option === 'Stats') {
                await savePokemonStats(folder, pokemonObject.stats)
            }
            if (option === 'Sprites') {
                await savePokemonSprites(folder, pokemonObject.sprites)
            }
            if (option === 'Artwork') {
                await savePokemonArtwork(folder, pokemonObject.sprites.other['official-artwork'])
            }
        }
    } catch(error) {
        console.error(`Something went wrong while parsing options: ${error}`)
    } finally {
        stopMessage()
        console.log('\nDownload complete.')
    }
}

export { parseOptions }
