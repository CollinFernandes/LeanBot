const axios = require('axios')

async function Login(deviceCode) {
    var status = 0;
    if (status == 0) {
        const headers = {
            'Authorization': "basic OThmN2U0MmMyZTNhNGY4NmE3NGViNDNmYmI0MWVkMzk6MGEyNDQ5YTItMDAxYS00NTFlLWFmZWMtM2U4MTI5MDFjNGQ3",
            'Content-Type': "application/x-www-form-urlencoded",

        }
        axios.post("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", `grant_type=device_code&device_code=${devicecode}`, {
            headers: headers
        }).then(response => {
            if (response.status_code == 200) {
                
            }
        })
    }
}