//#region HWID

/**
 * HWID will and is only used when you send a mob id, type and tier 
 * to the collaborative project. No other informations about you is
 * sent, and this information will never be used to identify yourself.
 * It is only use to add restrictions.
 */

const { platform } = require("node:process");

const { exec } = require("node:child_process");
const { promisify } = require("node:util");
var _exec = promisify(exec);
const Registry = require("winreg");

class HWID
{
    darwinHWID()
    {
        return new Promise(async (resolve) => {
            const { stdout } = await _exec("ioreg -rd1 -c IOPlatformExpertDevice");
            const uuid = stdout.trim().split("\n").find((line) => line.includes("IOPlatformUUID"))?.replaceAll(/=|\s+|"/gi, "").replaceAll("IOPlatformUUID", "");
            if (!uuid)
                Misc.error("failed to find hwid");
            resolve(uuid);
        });
    }
  
    linuxHWID() 
    {
        return new Promise(async (resolve) => {
            const { stdout } = await _exec(
            "cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || true"
            );
            const array = stdout.trim().split("\n");
            const first = array[0];
            if (!first)
                Misc.error("failed to find hwid");
            resolve(first);
        });
    }

    win32HWID()
    {
        return new Promise(async (resolve) => {
            const regKey = new Registry({
              hive: Registry.HKLM,
              key: "\\SOFTWARE\\Microsoft\\Cryptography"
            });
            const getKey = promisify(regKey.get.bind(regKey));
            const key = await getKey("MachineGuid");
            resolve(key.value.toLowerCase());
          });
    }
  
  // src/resolve.ts
    resolveID()
    {
        return new Promise(async (resolve) => {
            switch (platform) {
              case "win32":
                resolve(this.win32HWID());
                break;
              case "darwin":
                resolve(this.darwinHWID());
                break;
              case "linux":
                resolve(this.linuxHWID());
                break;
              default:
                Misc.error("unsupported platform");
            }
          });
    }
    
  
  // src/index.ts
    getHWID()
    {
        return new Promise(async (resolve) => {
            const hwid = await this.resolveID();
            if (hwid === "")
                Misc.error("failed to find hwid");
            resolve(hwid);
        });
    }
    
}

const hwid = new HWID();
//#endregion

//* Importing Axios *//
const axios = require('axios')

async function AddMobId(mob_id, mob_type, mob_tier)
{
    const u_hwid = await hwid.getHWID();

    const post_data = {
        hwid: u_hwid,
        mob_id: mob_id,
        mob_type: mob_type,
        mob_tier: mob_tier
    };

    const Json = await new Promise(async (resolve) => {
        axios.post('https://zq-mob-id-rest-api.vercel.app/add-mob', post_data).then((response) => {
            if (response && response.data)
            {
                resolve(response.data);
            }
            else
            {
                resolve(null);
            };
        }).catch((err) => resolve(null));
    });

    console.log("Mob Info Sent");

    if (Json != null && Json.success)
    {
        
    }
}

module.exports = {
    AddMobId,
}