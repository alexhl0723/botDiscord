const { PermissionsBitField } = require("discord.js");
// Roles que tienen acceso administrativo (IDs de roles)
const ADMIN_ROLES = [
    '1345538341658951786' // Reemplaza con el ID real del rol de administrador
];
// Comandos que solo admins pueden ver y usar
const ADMIN_COMMANDS = [
    'ban',
    'invitar-link',
    'limpiarmensajes',
    'reinvitacion-y-desban',
    'setbanner',
    'setimagen',
    'listban',
    'reinvitar',
    'setup-ticket on',
    'setup-ticket off',
    'setup-ticket edit'
];
// Comandos que todos los usuarios pueden ver y usar
const USER_COMMANDS = [
    'help',
    'ping',
    'ticket',
    'traductor',
    '8ball'
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
    // Si el usuario es admin, puede ejecutar cualquier comando
    if (esAdmin(member)) {
        return true;
    }
    
    // Si el comando es de usuario normal, permitir ejecución
    return USER_COMMANDS.includes(comandoNombre);
}

/**
 * Obtiene la lista de comandos disponibles para un usuario
 * @param {Object} member - El miembro del servidor de Discord
 * @returns {Array} - Lista de comandos que el usuario puede ejecutar
 */
function obtenerComandosDisponibles(member) {
    // Si es admin, devolver todos los comandos
    if (esAdmin(member)) {
        return [...ADMIN_COMMANDS, ...USER_COMMANDS];
    }
    
    // Si es usuario normal, devolver solo los comandos de usuario
    return [...USER_COMMANDS];
}

// Debug function para ayudar a identificar problemas de permisos
function debugPermisos(member, comandoNombre) {
    const isAdmin = esAdmin(member);
    const isUserCommand = USER_COMMANDS.includes(comandoNombre);
    const canExecute = puedeEjecutarComando(member, comandoNombre);
    
    console.log({
        usuario: member.user.tag,
        id: member.id,
        comando: comandoNombre,
        esAdmin: isAdmin,
        esComandoUsuario: isUserCommand,
        puedeEjecutar: canExecute,
        roles: Array.from(member.roles.cache.map(r => `${r.name} (${r.id})`))
    });
    
    return canExecute;
}

module.exports = {
    esAdmin,
    puedeEjecutarComando,
    obtenerComandosDisponibles,
    debugPermisos,
    ADMIN_COMMANDS,
    USER_COMMANDS
};