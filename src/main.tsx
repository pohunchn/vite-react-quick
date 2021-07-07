import React from 'react'
import ReactDOM from 'react-dom'
import AppRouter from './router'

import "antd/dist/antd.css"
import "./styles/setting.css"
import "./styles/global.css"
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
  document.getElementById('root')
)