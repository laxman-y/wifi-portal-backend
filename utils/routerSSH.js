const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();

async function runRouterCommand(command) {
  await ssh.connect({
    host: "vdlportal.duckdns.org",
    username: "root",
    password: process.env.ROUTER_SSH_PASSWORD, 
    port: 22
  });

  const result = await ssh.execCommand(command);
  ssh.dispose();
  return result;
}

module.exports = { runRouterCommand };
