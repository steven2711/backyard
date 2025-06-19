# Backyard Life - 16-Bit Adventure Game

A charming 16-bit style HTML5 game where you explore your backyard and interact with various objects. Features Super Nintendo-inspired graphics and full mobile support with touch controls.

## Features

- 🎮 **Retro 16-bit graphics** with pixel-perfect rendering
- 📱 **Mobile-friendly** with responsive design and touch controls
- 🎨 **Detailed sprites** with animations and visual effects
- 🌱 **Interactive objects** including garden, workbench, fire pit, and more
- 🕹️ **Dual control support** - keyboard for desktop, touch for mobile

## Controls

### Desktop
- **WASD** or **Arrow Keys** - Move character
- **Space** - Interact with objects

### Mobile
- **D-Pad** - Move character  
- **ACT Button** - Interact with objects

## Local Development

To run locally:

```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx http-server -p 3000
```

Then open `http://localhost:3000` in your browser.

## Deploy to Vercel

### Option 1: Deploy with Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

### Option 2: Deploy with GitHub
1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your GitHub repository
4. Vercel will automatically detect the configuration and deploy

### Option 3: Deploy with Git
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Backyard Life game"

# Push to GitHub and deploy via Vercel dashboard
```

## Game Mechanics

- **Exploration**: Move around the backyard to discover interactive objects
- **Activities**: Each object provides a unique activity when interacted with
- **Time Progression**: Days advance automatically as you play
- **Visual Feedback**: Activity messages appear when interacting with objects

## Technical Details

- **Pure HTML5/CSS3/JavaScript** - No external dependencies
- **Canvas-based rendering** with pixel-perfect graphics
- **Responsive design** that scales to any screen size
- **Touch-optimized** for mobile devices
- **Optimized for Vercel** static hosting

## Browser Support

- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers with HTML5 Canvas support

## License

MIT License - feel free to modify and distribute!