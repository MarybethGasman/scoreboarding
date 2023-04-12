import { decode, execute,print, fetch, issue, writeback } from './machine.js';


let clock = 0

fetch()

for (; ;) {
    
    writeback()
    execute()
    decode()
    try {
        issue()
    } catch (error) {
        console.log(error, "程序结束", clock);
        break;
    }

    clock++
    print(clock)
}