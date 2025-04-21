const fs = require('fs');
const path = require('path');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const readline = require('readline-sync');

const options = {
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	format: true,
	suppressEmptyNode: false,
	alwaysCreateTextNode: true,
};

const parser = new XMLParser(options);
const builder = new XMLBuilder(options);

function addResources() {
	// 1. Запрос пути к файлу
	const filePath = readline.question('Enter the path to the save file: ');
	const xmlData = fs.readFileSync(filePath, 'utf-8');
	const saveGame = parser.parse(xmlData);

	// 2. Поиск ColonyShip
	const colonyShip = saveGame['save-game'].ships.ship;

	if (!colonyShip) throw new Error('ColonyShip not found!');

	// 3. Выбор ресурса
	const resources = colonyShip['resource-container'].resource;
	const resourceTypes = [...new Set(resources.map(r => r['@_type']))];
	const resourceIndex = readline.keyInSelect(
		resourceTypes,
		'Select resource:'
	);

	if (resourceIndex === -1) throw new Error('Cancelled');
	const selectedType = resourceTypes[resourceIndex];

	// 4. Получение образца ресурса
	const sampleResource = resources.find(r => r['@_type'] === selectedType);
	if (!sampleResource) throw new Error('The resource sample was not found');

	// 5. Запрос количества
	const count = parseInt(readline.question('How many resources should add?'));
	if (isNaN(count)) throw new Error('Incorrect number');

	// 6. Генерация новых ресурсов
	let nextId = parseInt(saveGame['save-game']['id-generator']['next-id']['@_value']);
	const newResources = Array.from({ length: count }, () => ({
		'@_type': selectedType,
		id: { '@_value': nextId++ },
		'trader-id': { '@_value': '-1' },
		position: sampleResource.position,
		orientation: sampleResource.orientation,
		state: sampleResource.state,
		location: sampleResource.location,
		subtype: sampleResource.subtype,
		condition: sampleResource.condition,
		durability: sampleResource.durability,
	}));

	// 7. Обновление данных
	colonyShip['resource-container'].resource.push(...newResources);
	saveGame['save-game']['id-generator']['next-id']['@_value'] = nextId;
	colonyShip['resource-container']['capacity']['@_value'] = Number(colonyShip['resource-container']['capacity']['@_value']) + count + 10

	// 8. Сохранение файла
	const newXml = builder.build(saveGame);
	const newFilePath = path.join(
		path.dirname(filePath),
		path.basename(filePath, '.sav') + '_modified.sav'
	);

	fs.writeFileSync(newFilePath, newXml);
	console.log(`File saved: ${newFilePath}`);
}

function main() {
	try {
		addResources();
	} catch (e) {
		console.error(`Error: ${e.message}`);
		process.exit(1);
	}
}

main();
