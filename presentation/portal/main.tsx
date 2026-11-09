import{GuidedTour}from'./GuidedTour';
import{createRoot}from'react-dom/client';import{App}from'./App';import{Feedback}from'../feedback/Feedback';
createRoot(document.getElementById('app')!).render(<App/>);
const feedback=document.createElement('div');feedback.id='feedback-mount';document.body.append(feedback);createRoot(feedback).render(<><Feedback/><GuidedTour/></>);
