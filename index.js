const {
  Engine, 
  Render, 
  Runner, 
  World, 
  Bodies,
  Body,
  Events
} = Matter;

const cellsHorizontal = 15;
const cellsVertical = 10;
const width = window.innerWidth
const height = window.innerHeight;


const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y=0;
const {world} = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

//Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, {isStatic: true}),
  Bodies.rectangle(width / 2, height, width, 2, {isStatic: true}),
  Bodies.rectangle(0, height/2, 2, height, {isStatic: true}),
  Bodies.rectangle(width, height/2, 2, height, {isStatic: true}),
]

World.add(world, walls);

//Maze generation

const shuffle = arr => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--; //random number between 0 and arr.length (4)
    const temp = arr[counter]; //arr[random number]
    arr[counter] = arr[index]; 
    arr[index] = temp;
  }
  return arr;
};
// const grid = [];

// for(let i = 0; i < 3; i++){
//   grid.push([])
//   for (let j = 0; j <3 ; j++){
//     grid[i].push(false);
//   }
// };

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));


const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical- 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical); 
const startColumn = Math.floor(Math.random() * cellsHorizontal); 

const stepThroughCell = (row, column) => {
  //if i have visited the cell at [row, column], then return
  if (grid[row][column]){
    return;
  }
  //mark this cell as being visited (update grid array: true)
  grid[row][column] = true;

  //assemble randomly-ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, "up"], //above
    [row, column + 1, "right"], //right
    [row + 1, column, "down"],//below
    [row, column - 1, "left"] //left
  ]);
  //for each neighbor...
  for (let neighbor of neighbors) {
    const  [nextRow, nextColumn, direction] = neighbor;
    //see if that neighbor is out of bounds
    if (nextRow < 0 || 
      nextRow >= cellsVertical || 
      nextColumn < 0 || 
      nextColumn >= cellsHorizontal) {
      continue;
    }
    //if we have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }
    //remove a wall from either horizontals or verticals array
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    }
    else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }
    //visit that next cell (call stepThroughCell function + pass through row + column)
    stepThroughCell(nextRow, nextColumn);
  }

};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if(open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      10,
      {
        friction: 0,
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "red"
        }
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY/2,
      10,
      unitLengthY,
      {
        friction: 0,
        label: "wall",
        isStatic:true,
        render: {
          fillStyle: "red"
        }
      }
    );
    World.add(world, wall);
  })
})

//Goal

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * .7,
  unitLengthY * .7,
  {
    label: "goal",
    isStatic: true,
    render: {
      fillStyle: "green"
    }
  },

);

World.add(world, goal);

// Ball

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  unitLengthX/2,
  unitLengthY/2,
  ballRadius,
  {
    friction: 0,
    label: "ball"
  }
)

World.add(world, ball);

document.addEventListener("keydown", event => {
  const {x, y} = ball.velocity;
  if(event.key === "w" || event.key === "ArrowUp"){
    Body.setVelocity(ball, {x, y: -7})
  }
  if(event.key === "a" || event.key === "ArrowLeft"){
    Body.setVelocity(ball, {x: -7, y})
  }
  if(event.key === "s" || event.key === "ArrowDown"){
    Body.setVelocity(ball, {x, y: 7})
  }
  if(event.key === "d" || event.key === "ArrowRight"){
    Body.setVelocity(ball, {x: 7, y})
  }
});

document.addEventListener("keyup", event => {
  const {x, y} = ball.velocity;
  if(event.key === "w" || event.key === "ArrowUp"){
    Body.setVelocity(ball, {x, y: 0})
  }
  if(event.key === "a" || event.key === "ArrowLeft"){
    Body.setVelocity(ball, {x: 0, y})
  }
  if(event.key === "s" || event.key === "ArrowDown"){
    Body.setVelocity(ball, {x, y: 0})
  }
  if(event.key === "d" || event.key === "ArrowRight"){
    Body.setVelocity(ball, {x: 0, y})
  }
});

//Win Condition
Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(collision => {
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(".winner").classList.remove("hidden");
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if(body.label === "wall" || body.label === "goal") {
          Body.setStatic(body, false);
        }
      })
    }
  });
});