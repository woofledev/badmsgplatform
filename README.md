# badmsgplatform
![repo size](https://img.shields.io/github/repo-size/woofledev/badmsgplatform)

a simple, small size, room based messaging platform in nodejs, express and socket.io.<br>
readme still in progress!!

## setup
modules are ~30MB so you can host this on a raspberry pi or anything.
```sh
git clone https://github.com/woofledev/badmsgplatform && cd badmsgplatform
npm i
```
**↓↓↓**
### setting up the config
assuming you've cloned this repo, you have to create a configuration file first. 

create a file name `config.json`, and copy paste the content below. you might want to change the key btw
```json
{
    "PORT": 80,
    "SECRETKEY": "yoursecretgoeshere"
}
```
after this you're good to go! just launch it using `npm start`

## license
badmsgplatform is licensed under apache license 2.0
