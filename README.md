# Conductor
Role manager for private Discord events


# Features
- Discord JS v13
- Dockerized (and force to apply principle of least privilege)
- Brute-force protection in auth, denylist
- Redis cache
- CockroachDB

# Disclamer
I'm just a sysadmin and I don't know how to program, so I don't take responsibility for my code. ¯\_(ツ)_/¯  

# Commands

## Admin
Role: `🔒 root 🔑`   
|             Name            |                       Command                     |                  Function                | Example | DB connection? | Ready? |
| :-------------------------: | :------------------------------------------------ | :--------------------------------------- | :------ | :-: | :-: |
|       Create new team       | `/add team <name>`                                | Create new team by hand                  | /add team hexdump | Needed | ✅ |
|         Remove team         | `/remove team <name>`                             | Remove team by name                      | /remove hexdump | Needed | ✅ |
|       Create new user       | `/add user <team> <firstname> <lastname> <email>` | Create new user                          | /add user l337B015 John Doe a@b.com | Needed | ✅ |
|         Remove user         | `/remove user <email>`                            | Remove user                              | /remove user @D3v | Needed | ✅ |
|            Prune            | `/prune <int>`                                    | Clear chat                               | /prune 10 | Not needed | ✅ |
|         Open support        | `/unlock support`                                 | Open support option                      | /support unlock | Needed | ✅ |
|        Close support        | `/lock support`                                   | Close support option                     | /support lock | Needed | ✅ |
|   Lock support competitors  | `/lock support-comp`                              | Lock support option to competitors       | /lock support-comp | Not needed | ✅ |
|  Unlock support competitors | `/unlock support-comp`                            | Unlock support option to competitors     | /unlock support-comp | Not needed | ✅ |
|       User's teammates      | `/info teammates <users>`                         | Get information about user and teammates | /info teammates @D3v | Needed | ✅ |
|  User's stored data lookup  | `/info user <user>`                               | Get information about user               | /info user @D3v| Needed | ✅ |
|          Lock auth          | `/lock auth`                                      | Lockdown auth funciton                   | /lock auth | Needed | ✅ |
|         Unlock auth         | `/unlock auth`                                    | Unlock auth function                     | /unlock auth | Needed | ✅ |
|          User warn          | `/warn user <user>`                               | Send warn message to specific user       | /warn user @D3v | Not needed | ✅ |
|          Team warn          | `/warn team <user>`                               | Send warn message to the whole team      | /warn team @D3v | Needed | ✅ |
|       Finalists promote     | `/finalits promote <user>`                        | Promote user and his team to final round | /finalits promote @D3v | Needed | ✅ |
|         Lock submit         | `/lock submit`                                    | Lock submit option                       | /lock submit | Not needed | ✅ |
|        Unlock submit        | `/unlock submit`                                  | Unlock submit option                     | /unlock submit | Not needed | ✅ |

## Support
Role: `🔒 root 🔑`, `📞 Support 🛠`  
|         Name         |             Command              |                     Function                      |          Example      | DB connection? | Ready? |
| :------------------: | :------------------------------- | :------------------------------------------------ | :-------------------- | :------------: | :----: |
|  Clear support chat  | `/support clear <slot>`          | Clear whole support chat                          | /support clear   | Not needed | ✅ |
| Claim support ticket | `/support claim <ticket> <slot>` | Claim support ticket                              | /support claim 123e4567-e89b-12d3-a456-426614174000 4 | Needed | ✅ |
|     Close ticket     | `/support close <ticket>`        | Close ticket and clear whole slote history        | /support close 123e4567-e89b-12d3-a456-426614174000 | Needed | ✅ |
|      Ban user        | `/support ban <user>`            | Ban user to create new ticket                     | /support ban @D3v | Needed | ✅ |
|     Unban user       | `/support unban <user>`          | Unban the banned user                             | /support unban @D3v | Needed | ✅ |
|      NRQ/NRK         | `/support nrk <ticket>`          | Non relevant question/Nem releváns kérdés         | /support nrk 123e4567-e89b-12d3-a456-426614174000 | Needed | ✅ | 

## Finalist
Role: `🥇🥈🥉Finalists🥉🥈🥇`  
|         Name         |             Command              |                     Function                      |                Example            | DB connection? | Ready? |
| :------------------: | :------------------------------- | :------------------------------------------------ | :-------------------------------- | :------------: | :----: |
|      Submit flag     |         `/submit <flag>`         | Submit flag to system                             | /submit E5316BC4833CCEDEA8450FDE4 |     Needed     |   ✅   |


## Competitors
Role: `👨‍💻 Competitor 🖥`  
|          Name         |           Command         |               Function              |          Example           | DB connection? | Ready? |
| :-------------------: | :------------------------ | :---------------------------------- | :------------------------- | :------------: | :----: |
|   Open new ticket     | `/help support <message>` | Generate support ticket             | /help support Please help! |     Needed     |   ✅   |
|  My team information  | `/my team`                | Get information about my team       | /my team                   |     Needed     |   ✅   |
| My ticket information | `/my ticket`              | Get information about my ticket     | /my ticket                 |     Needed     |   ✅   |
|   Connection test     | `/ping ws`                | Test Conductor connection and delay | /ping ws                   |   Not needed   |   ✅   |


## Guest
Role: `🔒 root 🔑`, `🕵️ Guest 🥷`  
|          Name         |         Command       |         Function       |                                     Example                                     | DB connection? | Ready? |
| :-------------------: | :-------------------- | :--------------------- | :------------------------------------------------------------------------------ | :------------- | :----: |
| Player authentication | `/auth <team> <code>` | User authentication    | /auth 123e4567-e89b-12d3-a456-426614174000 123e4567-e89b-12d3-a456-426614174000 |     Needed     |   ✅   |
|       Available       | `/help commands`      | Get available commands | /help commands                                                                  |   Not needed   |   ✅   |


## Special and dangerous commands
Role: `🔒 root 🔑`  
|          Name         |             Command            |                  Function                    |                        Example                        | DB connection? | KV connection | Ready? |
| :-------------------: | :----------------------------- | :------------------------------------------- | :---------------------------------------------------- | :------------: | :-----------: | :----: |
|    Purge kv store     | `/remove kv`                   | Pruge whole kv store                         | `/remove kv`                                          |   Not needed   |     Needed    |   ✅   |
|    Purge channels     | `/remove kv-channels`          | Pruge cached channels                        | `/remove kv-channels`                                 |   Not needed   |     Needed    |   ✅   |
|     Purge roles       | `/remove kv-roles`             | Pruge cached roles                           | `/remove kv-roles`                                    |   Not needed   |     Needed    |   ✅   |
|     Clear ticket      | `/remove kv-ticket <ticketid>` | Clear stucked ticket                         | `/remove ticket 123e4567-e89b-12d3-a456-426614174000` |   Not needed   |     Needed    |   ✅   |
| Unban authbanned user | `/remove auth-unban <userid>`  | Unban auth banned user                       | `/remove auth-unban 80351110224678912`                |   Not needed   |     Needed    |   ✅   |
|   Clear all command   | `/remove slash`                | Remove all slash command from EVERYWHERE!!!! | `/remove slash`                                       |   Not needed   |     Needed    |   ✅   |
|    Set permission     | `/<command> stfr`              | Set in-guild permission to commands          | `/remove stfr `                                       |   Not needed   |   Not needed  |   ✅   |

## KV store (Redis)
| Name | Prefix |
| :--: | :----: |
| Support lock | `support` | 
| Competitors lock | `support-comp` |
| Auth lock | `auth` |
| Submit lock | `submit` |
| User support ban | `support-ban-${userId}` |
| Cached channel name - snowflake id pair | `cha-support-${slot}` |
| Cached role name - snowflake id pair | `rol-support-${slot}` |
| Cached ticket | `ticket-${ticketId}` |
| Cached ticket opener | `ticket-opener-${userId}` |
| Counter | `counter-${userId}` |
| Denylist | `denylist-${userId}` |

## Deploy
1. Create bot at [https://discord.com/developers](https://discord.com/developers)
2. Claim a token
3. Turn on the `Presence Intent` and `Server Members Intent` Privileged Gateway Intents settings
4. Invite bot in guild with permission `8`
5. Give an Administrator role to bot
6. Generate `FLAGS_SECRET`: `head -c 32 /dev/urandom | openssl enc | xxd -p -c 32`
7. Setup properly the environment variables
8. Register the slash commands with `node deploy-prod-commands.js` command
9. `./run_prod`
10. Remove key.pem and store in secure way.

## Tools
| Name | Link |
| :--: | :--: |
| Template visualizer | [https://leovoel.github.io/embed-visualizer/](https://leovoel.github.io/embed-visualizer/) |
| Embeded message sender | [https://discohook.org/](https://discohook.org/) |
