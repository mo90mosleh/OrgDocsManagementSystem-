import '@xyflow/react/dist/style.css';
import{GuidedTour}from'./GuidedTour';
import{lazy,Suspense}from'react';
import{createRoot}from'react-dom/client';import{App}from'./App';
const Feedback=lazy(()=>import('../feedback/Feedback').then(m=>({default:m.Feedback})));

createRoot(document.getElementById('app')!).render(<App/>);
const feedback=document.createElement('div');feedback.id='feedback-mount';document.body.append(feedback);createRoot(feedback).render(<>{window.__PORTAL_CONFIG__.feedbackEnabled!==false&&<Suspense fallback={null}><Feedback/></Suspense>}<GuidedTour/></>);
