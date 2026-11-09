import React from 'react';
import {createRoot} from 'react-dom/client';
import {Feedback} from './Feedback';
declare global {interface Window { __ORGDEMO_HASH_ROUTING__?:boolean }}
let root=document.getElementById('feedback-mount');
if(!root){root=document.createElement('div');root.id='feedback-mount';document.body.append(root);}
createRoot(root).render(<Feedback/>);
