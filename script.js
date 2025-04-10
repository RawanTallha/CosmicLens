function generateStarShadows(count) {
    let shadows = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 2000);
      const y = Math.floor(Math.random() * 2000);
      shadows.push(`${x}px ${y}px rgba(255, 255, 255, 0.34)`);
    }
    return shadows.join(', ');
  }
  
  const styleEl = document.getElementById('dynamic-stars');
  styleEl.innerHTML = `
    #small-stars {
      width: 1px;
      height: 1px;
      background: transparent;
      position: absolute;
      top: 0;
      left: 0;
      box-shadow: ${generateStarShadows(700)};
      animation: animStar 100s linear infinite;
    }
    #small-stars::after {
      content: " ";
      position: absolute;
      top: 2000px;
      width: 1px;
      height: 1px;
      background: transparent;
      box-shadow: ${generateStarShadows(700)};
    }
  
    #medium-stars {
      width: 2px;
      height: 2px;
      background: transparent;
      position: absolute;
      top: 0;
      left: 0;
      box-shadow: ${generateStarShadows(200)};
      animation: animStar 150s linear infinite;
    }
    #medium-stars::after {
      content: " ";
      position: absolute;
      top: 2000px;
      width: 2px;
      height: 2px;
      background: transparent;
      box-shadow: ${generateStarShadows(200)};
    }
  
    #large-stars {
      width: 3px;
      height: 3px;
      background: transparent;
      position: absolute;
      top: 0;
      left: 0;
      box-shadow: ${generateStarShadows(100)};
      animation: animStar 150s linear infinite;
    }
    #large-stars {
      content: " ";
      position: absolute;
      top: 2000px;
      width: 3px;
      height: 3px;
      background: transparent;
      box-shadow: ${generateStarShadows(100)};
    }
  `;
  
  