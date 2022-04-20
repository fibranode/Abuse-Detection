const { isIPv4 } = require("net");
const proxyManager = require("./utils/proxyManager");

//Usage: node abuseipdb.com.js <IP(/subnet)> <delay> <increaseFirst> <increaseSecond> <increaseThird> <increaseFourth>
var args = process.argv;
var ip = args[2];
var subnet;
var delay = args[3] || 150;
var increase = {
    first: args[4] || 0,
    second: args[5] || 0,
    third: args[6] || 0,
    fourth: args[7] || 0
}
var resultData = new Map();

start()
async function start() {
    if (!ip) return console.log('Usage: node abuseipdb.com.js <IP(/subnet - Increase will be ignored if a subnet is provided)> [delay] [increaseFirst] [increaseSecond] [increaseThird] [increaseFourth]');
    if (ip.split('/')[1]) {
        subnet = ip.split('/')[1];
        ip = ip.split('/')[0];
    };
    if (!isIPv4(ip)) return console.log('The IP you entered is not a valid IPv4 address.');
    if (!subnet == 24) return console.log('Currently only a /24 subnet is supported.');
    var ips = await buildRanges();
    var i = 0;
    var ready = true;
    var inter = setInterval(async function() {
        if (ready) {
            ready = false
            if (ips.length == i || !ips[i]) {
                clearInterval(inter);
                return save();
            }
            console.log(`Requesting ${ips[i]}`);
            var result = await requestDATA(ips[i]);
            if (!result) return;
            let times_reported = null;
            let dic_reported = null;
            let first_report = null;
            let most_recent = null;
                if (!result.data.includes('This IP has not been reported.')) {
                    times_reported = ( result.data.split('<h3 id=report class=text-center> IP Abuse Reports for <b')[1].split('</h3>')[1].split('<b>')[1]) ?  result.data.split('<h3 id=report class=text-center> IP Abuse Reports for <b')[1].split('</h3>')[1].split('<b>')[1].split('</b>')[0] : 0;
                    dic_reported = (result.data.split('<h3 id=report class=text-center> IP Abuse Reports for <b')[1].split('</h3>')[1].split('times from ')[1]) ? result.data.split('<h3 id=report class=text-center> IP Abuse Reports for <b')[1].split('</h3>')[1].split('times from ')[1].split(' distinct')[0] : 0;
                    first_report = ( result.data.split('<h3 id=report class=text-center> IP Abuse Reports for <b')[1].split('</h3>')[1].split('<time datetime')[1]) ? result.data.split('<h3 id=report class=text-center> IP Abuse Reports for <b')[1].split('</h3>')[1].split('<time datetime')[1].split('>')[1].split('</time>')[0] : null;
                    most_recent = (result.data.includes('most recent')) ? result.data.split('<h3 id=report class=text-center> IP Abuse Reports for <b')[1].split('</h3>')[1].split('most recent')[1].split('<time datetime')[1].split('>')[1].split('</time')[0] : null;
                } else {

                }
                    resultData.set(ips[i],{
                    ip: ips[i],
                    isp: (result.data.split('<th>ISP</th>')[1]) ? result.data.split('<th>ISP</th>')[1].split('</td>')[0].replace('<td>','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\t','').replace('\r','') : null,
                    usage_type: (result.data.split('<th>Usage Type</th>')[1]) ? result.data.split('<th>Usage Type</th>')[1].split('</td>')[0].replace('<td>','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\t','').replace('\r','') : null,
                    host_name: (result.data.split('<th>Hostname(s)</th>')[1]) ? result.data.split('<th>Hostname(s)</th>')[1].split('</td>')[0].replace('<td>','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\t','').replace('\r','') : null,
                    domain_name: (result.data.split('<th>Domain Name</th>')[1]) ? result.data.split('<th>Domain Name</th>')[1].split('</td>')[0].replace('<td>','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\t','').replace('\r','') : null,
                    city: (result.data.split('<th>City</th>')[1]) ? result.data.split('<th>City</th>')[1].split('</td>')[0].replace('<td>','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\t','').replace('\r','') : null,
                    country: (result.data.split('<th>Country</th>')[1]) ? result.data.split('<th>Country</th>')[1].split('</td>')[0].split('/>')[1].replace('<td>','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\n','').replace('\t','').replace('\r','') : null,
                    times_reported: times_reported,
                    dic_reported: dic_reported,
                    first_report: first_report,
                    most_recent: most_recent,
                });
            
            
            ready = true
            i++;
        }
    }, delay);
}

async function requestDATA(ip) {
    
    const axios = require('axios')
    const SocksAgent = require('axios-socks5-agent')
    
    const { httpAgent, httpsAgent } = SocksAgent({
      agentOptions: {
        keepAlive: true,
      },
      host: '107.180.132.30',
      port: 58978,
      username: '',
      password: '',
    })
    
    return await axios
      .get(`https://www.abuseipdb.com/check/${ip}`, {  })
      .then()
      .catch(e => console.log('Error while fetching data' + e))
}

async function buildRanges() {
    var ips = new Map();
    var ipArray = ip.split('.');
    if (!subnet) {
        ips.set(ip,ip);
        for (let i = 1; i < 256; i++) {
            if (parseInt(ipArray[0]) + parseInt(increase.first) * i > 255) break;
            if (parseInt(ipArray[1]) + parseInt(increase.second) * i > 255) break;
            if ( parseInt(ipArray[2]) + parseInt(increase.third) * i > 255) break;
            if (parseInt(ipArray[3]) + parseInt(increase.fourth) * i > 255) break;

            let f1 = parseInt(ipArray[0]) + parseInt(increase.first) * i
            let f2 = parseInt(ipArray[1]) + parseInt(increase.second) * i
            let f3 = parseInt(ipArray[1]) + parseInt(increase.second) * i
            let f4 = parseInt(ipArray[1]) + parseInt(increase.second) * i
            if (!ips.get(`${f1}.${f2}.${f3}.${f4}`,`${f1}.${f2}.${f3}.${f4}`)) ips.set(`${f1}.${f2}.${f3}.${f4}`,`${f1}.${f2}.${f3}.${f4}`)
        }
    }
    else if (subnet == 24) {
        for (let i = 1; i < 256; i++) {
            ips.set(i,`${ipArray[0]}.${ipArray[1]}.${ipArray[2]}.${i}`)
        }
    }

    var ipsArray = [];
    ips.forEach(e => {ipsArray.push((e))})
    return ipsArray;
}

function save() {
    resultData.forEach(console.log)
}