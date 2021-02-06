
import { BO_CONTRACT, PRICE_PROVIDER_CONTRACT, BIOP_CONTRACT, RATECALC_CONTRACT, DGOV_CONTRACT, V2BIOP_CONTRACT } from '../constants'
import { bigNumberStringToInt, greaterThan } from "./bignumber";


const zeroAddress = "0x0000000000000000000000000000000000000000";

// general functions
export function blockTimestamp(blockNumber: string, web3: any) {
  return new Promise(async (resolve, reject) => {
    try {
      const block = await web3.eth.getBlock(blockNumber);

      // tslint:disable-next-line:no-console
      console.log(` raw block is ${block}`);
      resolve(block.timestamp * 1000);
    } catch (e) {
      reject(e);
    }
  })
}

export function getPriceProviderContract(chainId: number, web3: any) {
  const pp = new web3.eth.Contract(
    PRICE_PROVIDER_CONTRACT[chainId].abi,
    PRICE_PROVIDER_CONTRACT[chainId].address
  )
  return pp;
}



export function getLatestPrice(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const biop = getPriceProviderContract(chainId, web3)
    await biop.methods
      .latestRoundData()
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }
          // tslint:disable-next-line:no-console
          console.log(data);
          // tslint:disable-next-line:no-console
          console.log("^ data is here");
          resolve(data.answer);
        }
      )
  })
}

// rate calc functions
export function getRateCalcContract(chainId: number, web3: any) {
  const rc = new web3.eth.Contract(
    RATECALC_CONTRACT[chainId].abi,
    RATECALC_CONTRACT[chainId].address
  )
  return rc;
}


export function getRate(amount: number, chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const rc = getRateCalcContract(chainId, web3)
    const max = await callPoolMaxAvailable(chainId, web3);
    await rc.methods
      .rate(amount, max, 0, 0, true)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data);
        }
      )
  })
}



// biop rewards functions
export function getBIOPContract(chainId: number, web3: any) {
  const bp = new web3.eth.Contract(
    BIOP_CONTRACT[chainId].abi,
    BIOP_CONTRACT[chainId].address
  )
  return bp;
}

export function callBIOPBalance(address: string, chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const bp = getBIOPContract(chainId, web3)
    await bp.methods
      .balanceOf(address)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}


export function callBIOPTotalSupply(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const bp = getBIOPContract(chainId, web3)
    await bp.methods
      .totalSupply()
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}

export function callBIOPAllowance(spender: string, address: string, chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const bp = getBIOPContract(chainId, web3)
    await bp.methods
      .allowance(address, spender)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}

export function sendBIOPApprove(spender: string, address: string, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {
    const bp = getBIOPContract(chainId, web3)
    const ts = await callBIOPTotalSupply(chainId, web3);
    await bp.methods
      .approve(spender, ts)
      .send(
        { from: address },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}

export function getDGovContract(chainId: number, web3: any) {
  const dgov = new web3.eth.Contract(
    DGOV_CONTRACT[chainId].abi,
    DGOV_CONTRACT[chainId].address
  );
  return dgov;
}

export function sendDGovStake(amount: string, address: string, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {
    const dgov = getDGovContract(chainId, web3)
    await dgov.methods
      .stake(amount)
      .send(
        { from: address },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}

export function sendDGovWithdraw(amount: string, address: string, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {
    const dgov = getDGovContract(chainId, web3)
    await dgov.methods
      .withdraw(amount)
      .send(
        { from: address },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}

export function callDGovStaked(address: string, chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const dgov = getDGovContract(chainId, web3)
    await dgov.methods
      .staked(address)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}

export function callDGovPendingETH(address: string, chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const dgov = getDGovContract(chainId, web3)
    await dgov.methods
      .pendingETHRewards(address)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}

export function callDGovRep(address: string, chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const dgov = getDGovContract(chainId, web3)
    await dgov.methods
      .rep(address)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}

export function sendDGovDelegate(rep: string, address: string, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {
    const dgov = getDGovContract(chainId, web3)
    await dgov.methods
      .delegate(rep)
      .send(
        { from: address },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}

export function sendDGovUnDelegate(address: string, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {
    const dgov = getDGovContract(chainId, web3)
    await dgov.methods
      .undelegate()
      .send(
        { from: address },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}

export function getV2TokenContract(chainId: number, web3: any) {
  const token = new web3.eth.Contract(
    V2BIOP_CONTRACT[chainId].abi,
    V2BIOP_CONTRACT[chainId].address
  );
  return token;
}


export function callV2BIOPBalance(address: string, chainId: number, web3: any): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const bp = getV2TokenContract(chainId, web3)
    await bp.methods
      .balanceOf(address)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(`${err}`);
          }

          resolve(data)
        }
      )
  })
}


export function callV2BIOPV3Approved(address: string, chainId: number, web3: any): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const bp = getV2TokenContract(chainId, web3)
    await bp.methods
      .allowance(address, BIOP_CONTRACT[chainId].address)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(`${err}`);
          }

          resolve(data)
        }
      )
  })
}

export function callV2BIOPTotalSupply(chainId: number, web3: any): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const bp = getV2TokenContract(chainId, web3)
    await bp.methods
      .totalSupply()
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(`${err}`);
          }

          resolve(data)
        }
      )
  })
}

export function sendV2ApproveV3(amount: any, address: string, chainId: number, web3: any, callback: any) {
  return new Promise(async (resolve, reject) => {
    const bp = getV2TokenContract(chainId, web3)
    // const ts = await callV2BIOPTotalSupply(chainId, web3);
    // tslint:disable-next-line:no-console
    // console.log(`sending v2v3 approve with ts ${ts}`);

    await bp.methods
      .approve(BIOP_CONTRACT[chainId].address, amount)
      .send(
        { from: address },
        (err: any, data: any) => {
          if (err) {
            reject(`${err}`);
          }
        }
      )
      .on('confirmation', callback)
  })
}

export function initiateSwapIfAvailable(address: string, chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const balance = await callV2BIOPBalance(address, chainId, web3);

    // tslint:disable-next-line:no-console
    console.log(`biop v2 balance is ${balance} type ${typeof (balance)}`);

    // tslint:disable-next-line
    if (greaterThan(balance, 0)) {
      if (window.confirm("BIOP v2 balance detected. Do you want to swap to v3?")) {
        // tslint:disable-next-line:no-console
        console.log(`user has v2 balance so we initiate swap`);
        const approved = await callV2BIOPV3Approved(address, chainId, web3);
         // tslint:disable-next-line:no-console
         console.log(`user has v2approved ${approved} amd balance ${balance}`);
       
        // user has v2 balance so we initiate swap

        if (approved >= balance) {
          // already approved, just second part
          const v3 = getBIOPContract(chainId, web3);

          // step 2: init swap
          await v3.methods
            .swapv2v3()
            .send(
              { from: address },
              (err: any, data: any) => {
                if (err) {
                  reject(err)
                }
                resolve(data)
              })
        } else {
          // step 1: approve v3 contract
          sendV2ApproveV3(balance, address, chainId, web3, async (d: any) => {
            const v3 = getBIOPContract(chainId, web3);

            // step 2: init swap
            await v3.methods
              .swapv2v3()
              .send(
                { from: address },
                (err: any, data: any) => {
                  if (err) {
                    reject(err)
                  }
                  resolve(data)
                })
          }
          )
        }

      }



    }
  });
}



export function getBOContract(chainId: number, web3: any) {
  const pool = new web3.eth.Contract(
    BO_CONTRACT[chainId].abi,
    BO_CONTRACT[chainId].address
  );
  return pool;
}

export function callBIOPPendingBalance(address: string, chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const bo = getBOContract(chainId, web3);
    await bo.methods
      .getPendingClaims(address)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data);
        }
      )
  })
}

export function claimRewards(address: string, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {

    const pool = getBOContract(chainId, web3);


    await pool.methods
      .claimRewards()
      .send(
        { from: address },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}





export function callSoldAmount(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const biop = getBOContract(chainId, web3)
    await biop.methods
      .totalSupply()
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          // tslint:disable-next-line:no-console
          console.log(`biop raw balance is ${data}`);
          resolve(data)
        }
      )
  })
}


// POOL functions 
export function callPoolTotalSupply(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const pool = getBOContract(chainId, web3)
    await pool.methods
      .totalSupply()
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}
export function callPoolMaxAvailable(chainId: number, web3: any): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const pool = getBOContract(chainId, web3)
    await pool.methods
      .getMaxAvailable()
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            // tslint:disable-next-line:no-console
            console.log(err);

            reject(0)
          }

          resolve(data)
        }
      )
  })
}

export function callPoolNextWithdraw(address: string, chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const pool = getBOContract(chainId, web3)
    await pool.methods
      .nW(address)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}

export function callPoolStakedBalance(address: string, chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const pool = getBOContract(chainId, web3)
    await pool.methods
      .balanceOf(address)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}

export function sendDeposit(address: string, amount: string, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {
    const pool = getBOContract(chainId, web3);
    // tslint:disable-next-line:no-console
    console.log(`depoyts`);
    // tslint:disable-next-line:no-console
    console.log(amount);
    // tslint:disable-next-line:no-console
    console.log(bigNumberStringToInt(amount));
    await pool.methods
      .stake()
      .send(
        { from: address, value: amount },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}

export function sendWithdraw(address: string, amount: string, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {
    const pool = getBOContract(chainId, web3);
    // tslint:disable-next-line:no-console
    console.log(`depoyts`);
    // tslint:disable-next-line:no-console
    console.log(amount);
    // tslint:disable-next-line:no-console
    console.log(bigNumberStringToInt(amount));
    await pool.methods
      .withdraw(amount)
      .send(
        { from: address },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}

export function getPoolLockedAmount(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const bo = getBOContract(chainId, web3)
    await bo.methods
      .lockedAmount()
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}


export function getDefaultPriceProvider(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const bo = getBOContract(chainId, web3)
    await bo.methods
      .defaultPriceProvider()
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}




// binary options functions
export function makeBet(address: string, amount: string, callOption: boolean, time: number, priceProvider: string, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {

    // tslint:disable-next-line:no-console 
    console.log(`make bet 2  senbt vy ${address} priceprovider ${priceProvider}, amount ${amount}`);
    const pool = getBOContract(chainId, web3);



    const formattedAmount = bigNumberStringToInt(amount);
    // tslint:disable-next-line:no-console 
    console.log(`bet amuynt raw type ${typeof (amount)}`);
    // tslint:disable-next-line:no-console 
    console.log(`bet amuynt raw ${amount}`);
    // tslint:disable-next-line:no-console
    console.log(`bet amuynt raw ${formattedAmount}`);

    const poolLockedAmount = await getPoolLockedAmount(chainId, web3);
    // tslint:disable-next-line:no-console
    console.log(`pool locked amount${poolLockedAmount}`);
    // tslint:disable-next-line:no-console
    console.log(`formatted amount ${formattedAmount}`);
    // tslint:disable-next-line:no-console
    //   console.log(`possible payout ${possiblePaout}`);

    // tslint:disable-next-line:no-console
    console.log(`${callOption} ${priceProvider} ${time} ${BO_CONTRACT[chainId].address}`);
    await pool.methods
      .bet(callOption, priceProvider, time)
      .send(
        { from: address, value: amount },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}

export function getPossiblePayout(amount: string, web3: any, chainId: number) {
  return new Promise(async (resolve, reject) => {
    const bin = getBOContract(chainId, web3);
    const formattedAmount = bigNumberStringToInt(amount);
    // tslint:disable-next-line:no-console
    console.log(`formatted amount ${formattedAmount}`);
    await bin.methods
      .calculatePossiblePayout(formattedAmount)
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}

export function getTotalInterchange( web3: any, chainId: number) {
  return new Promise(async (resolve, reject) => {
    const bin = getBOContract(chainId, web3);
    await bin.methods
      .tI()
      .call(
        { from: zeroAddress },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}

export function sendExpire(address: string, optionId: any, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {
    const bin = getBOContract(chainId, web3);
    // tslint:disable-next-line:no-console
    console.log(`expiring option #${optionId}`);
    await bin.methods
      .expire(optionId)
      .send(
        { from: address },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}

export function sendExercise(address: string, optionId: any, chainId: number, web3: any, onComplete: any) {
  return new Promise(async (resolve, reject) => {
    const bin = getBOContract(chainId, web3);
    // tslint:disable-next-line:no-console
    console.log(`expiring option #${optionId}`);
    await bin.methods
      .exercise(optionId)
      .send(
        { from: address },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
      .on('confirmation', onComplete)
      .on('error', onComplete)
  })
}




export function getAllEvents(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const bin = getBOContract(chainId, web3)
    await bin.getPastEvents('allEvents', {// 'create' evemt
      fromBlock: 'genesis',
      toBlock: 'latest'
    }, (error: any, events: any) => {
      if (error) {
        reject(error);
      }
      resolve(events);
    })
  })
}

export function getOptionCreation(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const bin = getBOContract(chainId, web3)
    await bin.getPastEvents('Create', {// 'create' evemt
      fromBlock: 'genesis',
      toBlock: 'latest'
    }, (error: any, events: any) => {
      if (error) {
        reject(error);
      }

      resolve(events);
    })
  })
}
export function getOptionExpiration(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const bin = getBOContract(chainId, web3)
    await bin.getPastEvents('Expire', {
      fromBlock: 'genesis',
      toBlock: 'latest'
    }, (error: any, events: any) => {
      resolve(events);
      if (error) {
        reject(error);
      }

      resolve(events);
    })
  })
}

export function getOptionExercise(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    const bin = getBOContract(chainId, web3)
    await bin.getPastEvents('Exercise', {
      fromBlock: 'genesis',
      toBlock: 'latest'
    }, (error: any, events: any) => {
      resolve(events);
      if (error) {
        reject(error);
      }

      resolve(events);
    })
  })
}

export function getOptionCloses(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    try {

      let options: any = await getOptionExpiration(chainId, web3);
      options = options.concat(await getOptionExercise(chainId, web3));
      resolve(options);
    } catch (e) {
      reject(e);
    }
  })
}

export function getOptionsAndCloses(chainId: number, web3: any) {
  return new Promise(async (resolve, reject) => {
    try {

      let options: any = await getOptionCreation(chainId, web3);
      options = options.concat(await getOptionExpiration(chainId, web3));
      options = options.concat(await getOptionExercise(chainId, web3));
      resolve(options);
    } catch (e) {
      reject(e);
    }
  })
}