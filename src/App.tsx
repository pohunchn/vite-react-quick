import React from 'react'
import logo from './logo.svg'
import './App.css'

import { createModel, useModel } from './lib/ts/Utils';
import { Link } from 'react-router-dom';

export let count = createModel(1);
let count2 = createModel({a: {b: {c: 1}}})

function App() {
  useModel(count);
  useModel(count2);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button onClick={() => count.value += 1 } >
            count is { count.value }
          </button>
          { " | " }
          <button onClick={() => {
            count2.value.a.b.c += 1;
            // 由于 count2 为一个对象并且层级过多，所以需要手动刷新一下
            count2.update();
          } }>
            count2 is { count2.value.a.b.c }
          </button>
        </p>
        <p>
          <Link to="about">点击我跳转到 about</Link>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}

export default App
