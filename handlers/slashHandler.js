const { readdirSync } = require("node:fs");
const { puedeEjecutarComando } = require("../Estructuras/Permisos");

module.exports = {
    async loadSlash(client) {
        // Cargar todos los comandos
        for (const category of readdirSync("./slashcommands")) {
            for (const otherCategory of readdirSync(`./slashcommands/${category}`)) {
                for (const fileName of readdirSync(`./slashcommands/${category}/${otherCategory}`).filter((file) => file.endsWith(".js"))) {
                    const command = require(`../slashcommands/${category}/${otherCategory}/${fileName}`);
                    
                    // Guardar la ruta del comando para referencia (útil para categorización)
                    command.categoryPath = `${category}/${otherCategory}`;
                    
                    client.slashCommands.set(command.name, command);
                }
            }
        }
        
        // Registrar todos los comandos globalmente
        await client.application?.commands.set(client.slashCommands.map((x) => x));
    },
    
    // Nuevo método para filtrar comandos según permisos
    filterCommandsByPermission(client, member) {
        const filteredCommands = [];
        
        client.slashCommands.forEach(command => {
            if (puedeEjecutarComando(member, command.name)) {
                filteredCommands.push(command);
            }
        });
        
        return filteredCommands;
    }
};