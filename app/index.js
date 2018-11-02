import { Delaunay } from "d3-delaunay";

document.addEventListener("DOMContentLoaded", () => {
    const canvasEl = document.getElementsByTagName("canvas")[0];
    canvasEl.width = 1000;
    canvasEl.height = 500;

    let cellCount = 100;
    const points = [];
    for (let i = 0; i < cellCount; i++) {
        points.push([
            Math.floor(canvasEl.width * Math.random()),
            Math.floor(canvasEl.height * Math.random())
        ]);
    }
    
    const voronoi = Delaunay.from(points).voronoi([
        0,
        0,
        canvasEl.width,
        canvasEl.height
    ]);
    console.log(voronoi); 

    const ctx = canvasEl.getContext("2d");
    voronoi.render(ctx);
    ctx.stroke();
});