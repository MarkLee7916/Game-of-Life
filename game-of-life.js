"use-strict";

const DEAD_COLOR =  "white"; 
const ALIVE_COLOR = "#FF6F61";

const global = {
	height: 50,
	width: 100,
	speed: 100,
	running: false,
	grid: []
}

initialiseGame();

function initialiseGame() {
	initialiseEmptyGrid();
	initialiseGridInDOM();

	initialiseDefaultTileStates();
	updateDOMWithNewTileStates();

	addEventListeners();
}

// Initialise grid where every Tile is dead
function initialiseEmptyGrid() {
	for (let row = 0; row < global.height; row++) {
		global.grid.push([]);
		for (let col = 0; col < global.width; col++) 
			global.grid[row].push(false);		
	}
}

// Dynamically generate HTML for a plain grid
function initialiseGridInDOM() {
	const gridDOM = document.querySelector("#grid");

	for (let row = 0; row < global.height; row++) 
		gridDOM.append(createRowInDOM(row));	
}	

function createRowInDOM(row) {
	const newRow = document.createElement("tr");

	newRow.className = "row";
	newRow.style.width = "600px";
	newRow.style.height = (600 / global.size) + "px";

	for (let i = 0; i < global.width; i++) 
		newRow.append(createTileInDOM(row, i));	

	return newRow;
}

function createTileInDOM(row, col) {
	const newTile = document.createElement("td");

	newTile.className = "tile";
	newTile.id = convertCoordinatesToID(row, col);
	newTile.style.width = (600 / global.size) + "px";
	newTile.style.height = (600 / global.size) + "px";

	return newTile;
}

function initialiseDefaultTileStates() {
	const probability = 0.3;

	for (let row = 0; row < global.height; row++) {
		for (let col = 0; col < global.width; col++) {
			if (randomProbability(probability))
				setAlive(global.grid, row, col);
		}
	}
}

// Example: an argument of 0.5 results in a 50/50 chance randomProbability() will return true
function randomProbability(probability) {
	return Math.random() < probability;
}

function updateDOMWithNewTileStates() {
	for (let row = 0; row < global.height; row++) {
		for (let col = 0; col < global.width; col++) {
			if (isAlive(row, col))
				colourTileInDOM(ALIVE_COLOR, row, col);
			else
				colourTileInDOM(DEAD_COLOR, row, col);
		}
	}
}

function isAlive(row, col) {
	return global.grid[row][col];
}

function colourTileInDOM(color, row, col) {
	const elemID = convertCoordinatesToID(row, col);
	const elemDOM = document.querySelector("#" + elemID); 

	elemDOM.style.backgroundColor = color;
}

// Given 2 co-ordinates, convert to a string ID that the html will understand
function convertCoordinatesToID(i, j) {
	return "r" + i + "c" + j;
}

function addEventListeners() {
	addClickListenerForStep();
	addClickListenerForRun();
	addClickListenerForReset();
	addChangeListenerForSpeedToggle();
}

function addClickListenerForReset() {
	const resetButton = document.querySelector("#reset");

	resetButton.addEventListener("click", refreshBrowser);
}

function refreshBrowser() {
	 location = location;
}

function addClickListenerForStep() {
	const stepButton = document.querySelector("#step");

	stepButton.addEventListener("click", stepForwardOneState);
}

function addClickListenerForRun() {
	const runButton = document.querySelector("#run");

	runButton.addEventListener("click", dealWithRunButtonInput);
}

function dealWithRunButtonInput(clickable) {
	const runButton = clickable.target;

	if (global.running) {
		global.running = false;
		runButton.innerHTML = "Run"
	}
	else {
		global.running = true;
		runButton.innerHTML = "Stop"
		run();
	}
}

function addChangeListenerForSpeedToggle() {
	const slider = document.querySelector("#speed-toggle");

	slider.addEventListener("change", updateSpeed);
}

function removeEventListenersToStopInterrupts() {
	removeClickListenerForStep();
}

function removeClickListenerForStep() {
	const stepButton = document.querySelector("#step");

	stepButton.removeEventListener("click", stepForwardOneState);
}

// Change speed of algorithm based on user changing value of slider
function updateSpeed(sliderEvent) {
	const slider = sliderEvent.target;

	global.speed = parseInt(slider.value);
}

// Move one state in the simulation
function stepForwardOneState() {
	const newGrid = deepCopyOfGrid();

	for (let row = 0; row < global.height; row++) {
		for (let col = 0; col < global.width; col++) {
			if (getAliveNeighbourCount(row, col) === 3)
				setAlive(newGrid, row, col);
			else if (isAlive(row, col) && getAliveNeighbourCount(row, col) === 2)
				setAlive(newGrid, row, col);
			else
				setDead(newGrid, row, col);
		}
	}

	global.grid = newGrid;
	updateDOMWithNewTileStates();
}

function deepCopyOfGrid() {
	return JSON.parse(JSON.stringify(global.grid));
}

async function run() {
	removeEventListenersToStopInterrupts();

	while (global.running) {
		stepForwardOneState();
		await wait();
	}

	addEventListeners();
}

// Wait based on the value of global.speed
async function wait() {
	return new Promise(resolve => { 
		setTimeout(() => { resolve() }, global.speed);
	});	
}

function getAliveNeighbourCount(row, col) {
	var neighbourCount = 0;

	if (isOnGrid(row - 1, col) && isAlive(row - 1, col))
		neighbourCount++;
	if (isOnGrid(row + 1, col) && isAlive(row + 1, col))
		neighbourCount++;
	if (isOnGrid(row, col - 1) && isAlive(row, col - 1))
		neighbourCount++;
	if (isOnGrid(row, col + 1) && isAlive(row, col + 1))
		neighbourCount++;
	if (isOnGrid(row - 1, col - 1) && isAlive(row - 1, col - 1))
		neighbourCount++;
	if (isOnGrid(row + 1, col + 1) && isAlive(row + 1, col + 1))
		neighbourCount++;
	if (isOnGrid(row + 1, col - 1) && isAlive(row + 1, col - 1))
		neighbourCount++;
	if (isOnGrid(row - 1, col + 1) && isAlive(row - 1, col + 1))
		neighbourCount++;

	return neighbourCount;
}

function isOnGrid(row, col) {
	return row >= 0 && row < global.height && col >= 0 && col < global.width;
}

function setAlive(gridArg, row, col) {
	gridArg[row][col] = true;
}

function setDead(gridArg, row, col) {
	gridArg[row][col] = false;
}

