import { Delaunay } from "d3-delaunay";

class Cell {
  constructor(i, voronoi) {
    this.id = i
    this.polygon = voronoi.cellPolygon(i);
    this.path = new Path2D(voronoi.renderCell(i));
    this.voronoi = voronoi;
    this.fill = {
      "red": 0,
      "green": 128,
      "blue": 255,
      "alpha": 1.0
    }
    this.border = {
      "red": 0,
      "green": 255,
      "blue": 255,
      "alpha": 1.0
    }
    this.neighbors = [...voronoi.delaunay.neighbors(this.id)].filter(cell => this.borders(cell));
  };

  borders(cell) {
    let id;
    if (cell instanceof Cell) {id = cell.id} else {id = cell};
    return this.polygon.some(([x, y]) => this.voronoi.cellPolygon(id).some(([x_, y_]) => x == x_ && y == y_));
  }
}
    

document.addEventListener("DOMContentLoaded", () => {
  const canvasEl = document.getElementsByTagName("canvas")[0];
  const ctx = canvasEl.getContext("2d");

  canvasEl.width = self.innerWidth;
  canvasEl.height = self.innerHeight;

  let points = [];

  // // Set up border cells
  // let borderDensity = 10

  // points.push([-100, -100], [canvasEl.width + 100, canvasEl.height + 100])
  // for (let w = 0; w < canvasEl.width; w += canvasEl.width / borderDensity) {
  //   points.push([w, -100]);
  //   points.push([w, canvasEl.height + 100]);
  // }

  // for (let h = 0; h < canvasEl.height; h += canvasEl.height / borderDensity) {
  //   points.push([-100, h]);
  //   points.push([canvasEl.width + 100, h]);
  // }

  let cellCount = points.length + (canvasEl.width * canvasEl.height / 5000);

  for (let i = points.length; i < cellCount; i++) {
    points.push([
      Math.floor(canvasEl.width * Math.random()),
      Math.floor(canvasEl.height * Math.random())
    ]);
  }

  const delaunay = Delaunay.from(points)

  // function drawDelaunay() {
  //   delaunay.render(ctx);
  //   ctx.strokeStyle = "rgba(0, 0, 0, 1.0)"
  //   ctx.lineWidth = 1;
  //   ctx.stroke();
  // }
  // drawDelaunay();

  const voronoi = delaunay.voronoi([0, 0, canvasEl.width, canvasEl.height]);

  function drawVoronoi() {
    voronoi.render(ctx);
    ctx.fillStyle = "rgba(0, 128, 255, 1.0)"
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.lineCap = 'round';
    ctx.strokeStyle = "rgba(0, 255, 255, 1.0)"
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  drawVoronoi();

  const allCells = [];
  
  for (let i = 0; i < cellCount; i++) {
    allCells.push(new Cell(i, voronoi));
  }

  function getMousePos(canvasEl, e) {
    let rect = canvasEl.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function fillCell(cell) {
    ctx.fillStyle = `rgba(${cell.fill.red}, ${cell.fill.green}, ${cell.fill.blue}, ${cell.fill.alpha})`
    ctx.strokeStyle = `rgba(${cell.border.red}, ${cell.border.green}, ${cell.border.blue}, ${cell.border.alpha})`
    ctx.fill(cell.path);
    ctx.stroke(cell.path);
  }

  function fillCells(cells) {
    for (let cell of cells) {
      fillCell(allCells[cell])
    }
  }

  function colorCell(cell, fillColor, borderColor) {
    cell.fill = {...cell.fill, ...fillColor}
    cell.border = borderColor;
  }

  function colorCells(cells, fillColor, borderColor) {
    for (let cell of cells) {
      colorCell(allCells[cell], fillColor, borderColor)
    }
  }

  function highlightCell(cell, fillColor, borderColor) {
    ctx.fillStyle = `rgba(${fillColor.red}, ${fillColor.green}, ${fillColor.blue}, ${fillColor.alpha})`
    ctx.strokeStyle = `rgba(${borderColor.red}, ${borderColor.green}, ${borderColor.blue}, ${borderColor.alpha})`
    ctx.fill(cell.path);
    ctx.stroke(cell.path);
  }

  function highlightCells(cells, fillColor, borderColor) {
    for (let cell of cells) {
      colorCell(allCells[cell], fillColor, borderColor)
    }
  }

  let prevHoverCell = allCells[0];
  let currentHoverCell = allCells[0];
  let currentNeighbors = [];
  let prevNeighbors = [];
  let otherCells = [];
  let paintCell = null;
  let button = 0;

  canvasEl.addEventListener('mousemove', (e) => {
    let mousePos = getMousePos(canvasEl, e);
    if (!voronoi.contains(currentHoverCell.id, mousePos.x, mousePos.y)) {
      for (let cell of allCells) {
        if (voronoi.contains(cell.id, mousePos.x, mousePos.y)) {
          prevHoverCell = currentHoverCell;
          prevNeighbors = currentNeighbors;
          currentHoverCell = cell;
          currentNeighbors = currentHoverCell.neighbors
        } else {
          otherCells.push(cell)
        };
      }
    }
    
    if (currentHoverCell != prevHoverCell) {
      // colorCells(prevNeighbors, { red: 0, green: 128, blue: 255, alpha: 1.0 }, { red: 0, green: 255, blue: 255, alpha: 1.0 });
      // fillCells(prevNeighbors);

      // colorCell(prevHoverCell, { red: 0, green: 128, blue: 255, alpha: 1.0 }, { red: 0, green: 255, blue: 255, alpha: 1.0 });
      // fillCell(prevHoverCell);

      // highlightCells(currentNeighbors, { red: 128, green: 128, blue: 255, alpha: 1.0 }, { red: 0, green: 255, blue: 255, alpha: 1.0 });

      // highlightCell(currentHoverCell, currentHoverCell.fill, { red: 255, green: 255, blue: 255, alpha: 1.0 });
      prevHoverCell.border.red = 0;
      currentHoverCell.border.red = 255;
    }

  }, false);

  canvasEl.addEventListener("mousedown", (mouse) => {
    button = mouse.button;
    paintCell = currentHoverCell;
  }, false);

  canvasEl.addEventListener("mouseup", () => {
    if (paintCell) {colorCell(paintCell, paintCell.fill, { red: 0, green: 255, blue: 255, alpha: 1.0 })}
    paintCell = null;
  }, false);

  window.setInterval(() => {
    if (paintCell && paintCell.fill.red < 255) {
      paintCell.fill.red += 1;
      colorCell(paintCell, paintCell.fill, { red: 255, green: 255, blue: 255, alpha: 1.0 })
      fillCell(paintCell);
    }
  }, 10);

  window.setInterval(() => {
    let rednesses = [];
    for (let cell of allCells) {
      rednesses.push(cell.neighbors.reduce((sum, neighbor) => {
      return sum + allCells[neighbor].fill.red
      },0) / cell.neighbors.length)
    }
    for (let i = 0; i < rednesses.length; i++) {
      if (allCells[i] != paintCell){
        if (allCells[i].fill.red < rednesses[i]) {
          allCells[i].fill.red += 1;
        } else if (allCells[i].fill.red > rednesses[i]) {
          allCells[i].fill.red -= 1;
        }
        fillCell(allCells[i]);
      }
    }
  }, 10);

  // window.setInterval(() => {
  //   fillCells(allCells);
  // }, 10);

});