"use strict";
var gravity = 0.2;
var dampening = 0.9;
var colors = ['blue', 'yellow', 'red', 'green', 'purple'];
var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = 650;
canvas.height = 650;
canvas.style.border = '1px solid black';
var context = canvas.getContext('2d');
var circles = [];
var draggedCircle = null;
var prevMousePosition = null;
var getRandomNumber = function () {
    return Math.floor(Math.random() * colors.length);
};
var handleCanvasClick = function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var circle = circles.find(function (circle) { return Math.hypot(circle.x - x, circle.y - y) < circle.radius; });
    if (!circle) {
        var newCircle = {
            x: x,
            y: y,
            radius: 10, vx: 0, vy: 0, isDragging: false, mass: 5, color: colors[getRandomNumber()]
        };
        circles.push(newCircle);
    }
};
var handleMouseDown = function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var circle = circles.find(function (circle) { return Math.hypot(circle.x - x, circle.y - y) < circle.radius; });
    if (circle) {
        circle.isDragging = true;
        draggedCircle = circle;
        prevMousePosition = { x: x, y: y };
    }
};
var handleMouseMove = function (event) {
    if (draggedCircle) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        draggedCircle.x = x;
        draggedCircle.y = y;
    }
};
var handleMouseUp = function (event) {
    if (draggedCircle && prevMousePosition) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var deltaX = x - prevMousePosition.x;
        var deltaY = y - prevMousePosition.y;
        var time = 100;
        draggedCircle.vx = deltaX / time;
        draggedCircle.vy = deltaY / time;
        draggedCircle.isDragging = false;
        draggedCircle = null;
        prevMousePosition = null;
    }
};
var drawCircle = function (circle, context) {
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    context.fillStyle = circle.color;
    context.fill();
    context.stroke();
};
var checkCollisions = function () {
    for (var i = 0; i < circles.length; i++) {
        for (var j = i + 1; j < circles.length; j++) {
            var circle1 = circles[i];
            var circle2 = circles[j];
            var dx = circle2.x - circle1.x;
            var dy = circle2.y - circle1.y;
            var distance = Math.hypot(dx, dy);
            if (distance < circle1.radius + circle2.radius) {
                var nx = dx / distance;
                var ny = dy / distance;
                var tx = -ny;
                var ty = nx;
                var dpTan1 = circle1.vx * tx + circle1.vy * ty;
                var dpTan2 = circle2.vx * tx + circle2.vy * ty;
                var dpNorm1 = circle1.vx * nx + circle1.vy * ny;
                var dpNorm2 = circle2.vx * nx + circle2.vy * ny;
                var m1 = (dpNorm1 * (circle1.mass - circle2.mass) + 2 * circle2.mass * dpNorm2) / (circle1.mass + circle2.mass);
                var m2 = (dpNorm2 * (circle2.mass - circle1.mass) + 2 * circle1.mass * dpNorm1) / (circle1.mass + circle2.mass);
                circle1.vx = tx * dpTan1 + nx * m1;
                circle1.vy = ty * dpTan1 + ny * m1;
                circle2.vx = tx * dpTan2 + nx * m2;
                circle2.vy = ty * dpTan2 + ny * m2;
                var overlap = 0.5 * (circle1.radius + circle2.radius - distance + 1);
                circle1.x -= overlap * nx;
                circle1.y -= overlap * ny;
                circle2.x += overlap * nx;
                circle2.y += overlap * ny;
            }
        }
    }
};
var updateCircles = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(function (circle) {
        if (!circle.isDragging) {
            circle.vy += gravity * circle.mass;
            circle.x += circle.vx;
            circle.y += circle.vy;
            if (circle.x - circle.radius < 0) {
                circle.x = circle.radius;
                circle.vx *= -(dampening * 0.7);
            }
            else if (circle.x + circle.radius > canvas.width) {
                circle.x = canvas.width - circle.radius;
                circle.vx *= -dampening;
            }
            if (circle.y - circle.radius <= 0) {
                circle.y = circle.radius;
                circle.vy *= -dampening;
            }
            if (circle.y + circle.radius > canvas.height) {
                circle.y = canvas.height - circle.radius;
                circle.vy *= -dampening;
            }
        }
        drawCircle(circle, context);
    });
    checkCollisions();
    if (prevMousePosition) {
        var deltaX = circles[0].x - prevMousePosition.x;
        var deltaY = circles[0].y - prevMousePosition.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        var speed = distance / 5;
        console.log('Mouse Speed:', speed);
    }
    requestAnimationFrame(updateCircles);
};
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', handleMouseUp);
updateCircles();
