import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import {ChakraProvider} from '@chakra-ui/react'
import {MoralisProvider} from 'react-moralis'
const serverUrl = 'https://hhwoxem3ps7h.usemoralis.com:2053/server'
const appId = 'uBxwEA2qBwCUy0M5OPh76jAyVCqfrhKNNhiNZFx9'
ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider appId={appId} serverUrl={serverUrl}>
      {' '}
      <ChakraProvider>
        <App />
      </ChakraProvider>{' '}
    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
