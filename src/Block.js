import React from 'react';
import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Identicon from 'react-identicons';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);
var block = {};
var error = false;

function Block() {
  const { paramBlockNumber } = useParams();

  //for highlighting a transaction
  const { search } = useLocation();
  const searchMatch = search.match(/highlightTransaction=(.*)/);
  const highlightTransaction = searchMatch?.[1];

  const [blockNumber, setBlockNumber] = useState();

  /*
    Identicon params, use later for theme
    size: (Number) Single number to represent width and height of identicon image. Defaults to 400.
    padding (Number) Padding around blocks. Defaults to 0.
    bg (String) Override color for background blocks. Transparent by default.
    fg (String) Override color for foreground blocks. Generated randomly from hash by default.
    palette (Array) Provide an array of colors to be used as foreground block colors.
  */

  async function getBlock() {
    var number = undefined;
    if (paramBlockNumber != null) {
      if (paramBlockNumber.slice(0,2) === "0x") {
        number = paramBlockNumber;
      } else if (parseInt(paramBlockNumber) > 0 && parseInt(paramBlockNumber) === paramBlockNumber) { //prevents "3c9e84" parsing into 3
        number = parseInt(paramBlockNumber);
      } else {
        error = true;
      }
    }

    if (!error) {
      block = await alchemy.core.getBlockWithTransactions(number);
    }

    //used to tell React to render, I'm sure there's a better way though.
    setBlockNumber(block.number);
  }

  useEffect(() => {
    getBlock();
  });
  
  if (error) {
    return <h1>😢 That's not a block number we can find!</h1>
  }

  if (block.number === undefined) {
    return <h1>Loading...</h1>
  }

  return (
    <div className="App">
      <h1>Block</h1>
      <Identicon string={blockNumber} />
      <table id="blockParts">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Block Number</td>
            <td>{blockNumber}</td>
          </tr>
          <tr>
            <td>Hash</td>
            <td>{block.hash}</td>
          </tr>
          <tr>
            <td>Parent Hash</td>
            <td><Link to={`/block/${block.parentHash}`}>{block.parentHash}</Link></td>
          </tr>
          <tr>
            <td>Timestamp</td>
            <td>{new Date(block.timestamp * 1000).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Nonce</td>
            <td>{block.nonce}</td>
          </tr>
          <tr>
            <td>Miner</td>
            <td>{block.miner}</td>
          </tr>
          <tr>
            <th colSpan="2">Gas</th>
          </tr>
          <tr>
            <td>Base Fee Per Gas</td>
            <td>{block.baseFeePerGas ? block.baseFeePerGas.toString() : "n/a"}</td>
          </tr>
          <tr>
            <td>Gas Used</td>
            <td>{block.gasUsed.toString()} / {block.gasLimit.toString()} max</td>
          </tr>
          <tr>
            <th colSpan="2">Misc</th>
          </tr>
          <tr>
            <td>Difficulty</td>
            <td>{block.difficulty}</td>
          </tr>
          <tr>
            <td>Extra Data</td>
            <td>{block.extraData}</td>
          </tr>
        </tbody>
      </table>
      <table id="transactions">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>More</th>
          </tr>
        </thead>
        <tbody>
          {block.transactions.map(t => (
            <tr key={t.transactionIndex} class={t.hash === highlightTransaction ? "highlight" : ""}>
              <td>{t.from}</td>
              <td>{t.to}</td>
              <td>{t.value.toString()}</td>
              <td><Link to={`/transaction/${t.hash}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Block;
