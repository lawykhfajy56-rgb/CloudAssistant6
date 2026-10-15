Updated: replace floating cloud UI with floating robot assistant (الخفاجي AI).

- Added apps/web/src/components/FloatingRobot.jsx
- Added styling apps/web/src/components/FloatingRobot.css
- Floating robot is a persistent overlay button (bottom-right). Clicking it opens a panel containing the ScreenTranslator component.

Integration instructions:
- If you are using a React app, import and mount the component near the root of your app (e.g., in App.jsx):

  import FloatingRobot from './components/FloatingRobot';
  
  function App(){
    return (
      <>
        {/* existing app */}
        <FloatingRobot />
      </>
    )
  }

- Ensure that the bundler can import SVG files as React components or provide the correct path (the component currently imports the SVG as a module).
- If your project uses a `public` folder for static assets, move `assets/alkhafaji-ai.svg` there and update the <img src="..."> path accordingly.
