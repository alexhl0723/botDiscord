const { PermissionsBitField } = require("discord.js");

// Roles que tienen acceso administrativo (IDs de roles)
const ADMIN_ROLES = [
    '1345538341658951786'// Reemplaza con el ID real del rol de administrador
];

// Comandos que solo admins pueden ver y usar
const ADMIN_COMMANDS = [
    'ban',
    'invitar-link',
    'limpiarmensajes',
    'ping',
    'reinvitacion-y-desban',
    'setbanner',
    'setimagen',
    'traductor',
    '8ball',
    'limpiarmensajes',
    'listban',
    'reinvitar',
    'help',
    'setup-ticket on',
    'setup-ticket off',
    'setup-ticket edit',
    // Añade aquí todos los comandos de administrador
];

// Comandos que todos los usuarios pueden ver y usar
const USER_COMMANDS = [
    'help',
    'ping',
    'ticket',
    'traductor',
    '8ball'
    // Añade aquí todos los comandos para usuarios normales
];

/**
 * Verifica si un usuario tiene permisos de administrador
 * @param {Object} member - El miembro del servidor de Discord
 * @returns {Boolean} - True si el usuario es administrador
 */
function esAdmin(member) {
    // Si el usuario es el dueño del servidor o tiene permisos de administrador
    if (member.permissions.has(PermissionsBitField.Flags.Administrator) || 
        member.id === member.guild.ownerId) {
        return true;
    }
    
    // Verificar si tiene alguno de los roles de admin
    return member.roles.cache.some(role => ADMIN_ROLES.includes(role.id));
}

/**
 * Verifica si un usuario puede ejecutar un comando específico
 * @param {Object} member - El miembro del servidor de Discord
 * @param {String} comandoNombre - Nombre del comando a verificar
 * @returns {Boolean} - True si puede ejecutar el comando
 */
function puedeEjecutarComando(member, comandoNombre) {
    // Si el comando es de admin, verificar permisos
    if (ADMIN_COMMANDS.includes(comandoNombre)) {
        return esAdmin(member);
    }
    
    // Si el comando es de usuario normal, todos pueden usarlo
    if (USER_COMMANDS.includes(comandoNombre)) {
        return true;
    }
    
    // Si el comando no está en ninguna lista, por defecto solo admin
    return esAdmin(member);
}

module.exports = {
    esAdmin,
    puedeEjecutarComando,
    ADMIN_COMMANDS,
    USER_COMMANDS
};