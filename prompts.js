import inquirer from 'inquirer'
import { parseOptions } from './saving.js'

async function fetchData(name) {
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`

    try {
        const response = await fetch(url)
        const data = response.json()
        return data
    } catch (error) {
        console.error(`Error fetching json data from url: ${error}`)
    }
}

async function promptForPokemon() {
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Pokemon name:"
        }
    ])
    const data = await fetchData(answers.name)
    return data
}

async function promptForDownloadInfo() {
    const options = await inquirer.prompt([
        {
            type: "checkbox",
            name: "options",
            message: "Select info to download:",
            choices: [
                new inquirer.Separator("-- Options --"),
                { name: "Stats" },
                { name: "Sprites" },
                { name: "Artwork" }
            ]
        }
    ])
    return options
}

async function promptToContinue() {
    const confirm = await inquirer.prompt([
        {
            type: "confirm",
            name: "searchAgain",
            message: "Search for another pokemon?"
        }
    ])
    return confirm.searchAgain
}

async function promptUser() {
    let searchAgain = true

    while(searchAgain) {
        const pokemonObject = await promptForPokemon()
        const optionsObject = await promptForDownloadInfo()

        if(optionsObject.options.length > 0) {
            await parseOptions(pokemonObject, optionsObject)
        }
        searchAgain = await promptToContinue()
    }
}

export { promptUser }