# DEVAID: Level Up Your Development 🚀

## Installation 

To use devaid, you can install it via 

``` bash
npm install -g devaid
```

**Note:** If you encounter a permission issue while installing globally with npm, you may need to run the command with `sudo`.

```bash
sudo npm install -g devaid
```

## Commands List

- `devaid --help | devaid -h`: Generates server files for backend APIs.

- `devaid setup-server | devaid ss`: Generates server files for backend APIs.

- `devaid setup-crud | devaid scrud`: Generates CRUD files for backend APIs.

- `*`: This is a wildcard command. It could be used as a default or catch-all command when no other matching command is found.

- `devaid help [command]`: Displays help information for a specific command. If a command is provided as an argument, it shows help for that particular command.

## Command Examples

### 1. setup-server | ss

To generate server files for backend APIs, use the following command:

``` bash
devaid ss
```

### 2. setup-crud | scrud

To generate CRUD files for backend APIs, use the following command:

``` bash
devaid scrud
```

### 3. help [command]

To display help information for a specific command, use the following command:

``` bash
devaid help setup-server
```

## License

This project is licensed under the AGPL 3.0 license. You can find the full license text in the LICENSE file.

