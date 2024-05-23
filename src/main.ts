interface Circle {
    x: number;
    y: number;
    radius: number;
    vx: number; 
    vy: number; 
    isDragging: boolean; 
    mass: number; 
    color: string;
  }
  
  const gravity = 0.2;
  const dampening = 0.9;
  const colors = ['blue', 'yellow', 'red', 'green', 'purple'];
  
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = 650;
  canvas.height = 650;
  canvas.style.border = '1px solid black';
  
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const circles: Circle[] = [];
  let draggedCircle: Circle | null = null;
  let prevMousePosition: { x: number; y: number } | null = null;
  
  const getRandomNumber = () => {
    return Math.floor(Math.random() * colors.length);
  };
  
  
  const handleCanvasClick = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
  
    const circle = circles.find(
      (circle) => Math.hypot(circle.x - x, circle.y - y) < circle.radius
    );
  
    
    if (!circle) {
      const newCircle: Circle = { 
        x, y, radius: 10, vx: 0, vy: 0, isDragging: false, mass: 5, color: colors[getRandomNumber()] 
      };
      circles.push(newCircle);
    }
  };
  

  const handleMouseDown = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const circle = circles.find(
      (circle) => Math.hypot(circle.x - x, circle.y - y) < circle.radius
    );
    if (circle) {
      circle.isDragging = true;
      draggedCircle = circle;
      prevMousePosition = { x, y };
    }
  };
  

  const handleMouseMove = (event: MouseEvent) => {
    if (draggedCircle) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      draggedCircle.x = x;
      draggedCircle.y = y;
    }
  };
  

  const handleMouseUp = (event: MouseEvent) => {
    if (draggedCircle && prevMousePosition) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const deltaX = x - prevMousePosition.x;
      const deltaY = y - prevMousePosition.y;
      const time = 100; 
  
      
      draggedCircle.vx = deltaX / time;
      draggedCircle.vy = deltaY / time;
  
      draggedCircle.isDragging = false;
      draggedCircle = null;
      prevMousePosition = null;
    }
  };
  
  
  const drawCircle = (circle: Circle, context: CanvasRenderingContext2D) => {
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    context.fillStyle = circle.color;
    context.fill();
    context.stroke();
  };
  
  
  const checkCollisions = () => {
     for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const circle1 = circles[i];
        const circle2 = circles[j];
        const dx = circle2.x - circle1.x;
        const dy = circle2.y - circle1.y;
        const distance = Math.hypot(dx, dy);

        if (distance < circle1.radius + circle2.radius) {
          
          const nx = dx / distance;
          const ny = dy / distance;
          const tx = -ny;
          const ty = nx;

          
          const dpTan1 = circle1.vx * tx + circle1.vy * ty;
          const dpTan2 = circle2.vx * tx + circle2.vy * ty;

          const dpNorm1 = circle1.vx * nx + circle1.vy * ny;
          const dpNorm2 = circle2.vx * nx + circle2.vy * ny;

          
          const m1 = (dpNorm1 * (circle1.mass - circle2.mass) + 2 * circle2.mass * dpNorm2) / (circle1.mass + circle2.mass);
          const m2 = (dpNorm2 * (circle2.mass - circle1.mass) + 2 * circle1.mass * dpNorm1) / (circle1.mass + circle2.mass);

          
          circle1.vx = tx * dpTan1 + nx * m1;
          circle1.vy = ty * dpTan1 + ny * m1;
          circle2.vx = tx * dpTan2 + nx * m2;
          circle2.vy = ty * dpTan2 + ny * m2;

          
          const overlap = 0.5 * (circle1.radius + circle2.radius - distance + 1);
          circle1.x -= overlap * nx;
          circle1.y -= overlap * ny;
          circle2.x += overlap * nx;
          circle2.y += overlap * ny;
        }
      }
    }
  };
  
  
  const updateCircles = () => 
    {
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    circles.forEach((circle) => {
      if (!circle.isDragging) {
        circle.vy += gravity * circle.mass; 
        circle.x += circle.vx;
        circle.y += circle.vy;
  
        
        if (circle.x - circle.radius < 0) {
          circle.x = circle.radius;
          circle.vx *= -(dampening * 0.7); 
        } else if (circle.x + circle.radius > canvas.width) {
          circle.x = canvas.width - circle.radius;
          circle.vx *= -dampening; 
        }
  
        
        if (circle.y - circle.radius <= 0) {
          circle.y = circle.radius;
          circle.vy *= -dampening; 
        }  if (circle.y + circle.radius > canvas.height) {
          circle.y = canvas.height - circle.radius;
          circle.vy *= -dampening; 
        }
      }
      drawCircle(circle, context);
    });
  
    checkCollisions();
  
    
    if (prevMousePosition) {
      const deltaX = circles[0].x - prevMousePosition.x;
      const deltaY = circles[0].y - prevMousePosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const speed = distance / 5; 
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
  