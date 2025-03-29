const SpotifyWebApi = require('spotify-web-api-node');
const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


module.exports = {
  name: 'spoty',
  description: 'Reproduce una canción desde Spotify o por nombre',
  cooldown: 5,
  usage: '<enlace de Spotify o nombre de la canción>',
  aliases: ['spotify', 'sp'],
  options: [
    {
      name: 'cancion',
      description: 'Reproduce una canción desde Spotify o por nombre o enlace',
      type: 3,
      required: true,
    },
  ],

  async execute(client, message, args) {
    // Check if user is in a voice channel
    if (!message.member.voice.channel) {
      return message.channel.send('❌ Debes estar en un canal de voz para usar este comando.');
    }
    
    // Check if arguments were provided
    if (!args.length) {
      return message.channel.send('❌ Debes proporcionar un enlace de Spotify o nombre de canción.');
    }

    const input = args.join(' ');
    
    // Send a loading message
    const loadingMsg = await message.channel.send('🔄 Procesando solicitud...');
    
    try {
      // For non-Spotify URLs, go straight to search
      if (!isSpotifyUrl(input)) {
        await loadingMsg.edit('🔍 Buscando canción...');
        return await searchByName(client, message, input, loadingMsg);
      }
      
      // Extract track ID if it's a Spotify URL
      const trackId = await extractTrackId(input);
      
      if (!trackId) {
        await loadingMsg.edit('❌ No se pudo extraer el ID de la canción del enlace proporcionado.');
        return;
      }
      
      await loadingMsg.edit('🎵 Cargando canción de Spotify...');
      return await processSpotifyTrack(client, message, trackId, loadingMsg);
    } catch (error) {
      console.error('Error en comando Spotify:', error);
      await loadingMsg.edit('❌ Ocurrió un error al procesar tu solicitud.');
    }
  },
};

// Check if input is a Spotify URL
function isSpotifyUrl(input) {
  const patterns = [
    /spotify:track:[a-zA-Z0-9]+/,
    /open\.spotify\.com\/track\/[a-zA-Z0-9]+/,
    /open\.spotify\.com\/intl-[a-z]+\/track\/[a-zA-Z0-9]+/,
    /spotify\.link\/[a-zA-Z0-9]+/,
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

// Extract track ID from Spotify URL
async function extractTrackId(input) {
  // Handle spotify.link short URLs
  if (input.includes('spotify.link')) {
    try {
      const response = await fetch(input, { 
        method: 'HEAD',
        redirect: 'follow'
      });
      
      input = response.url; // Use the resolved URL
    } catch (error) {
      console.error('Error al resolver enlace corto:', error);
      return null;
    }
  }
  
  // Extract track ID from various formats
  const patterns = [
    /spotify:track:([a-zA-Z0-9]+)/,
    /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
    /open\.spotify\.com\/intl-[a-z]+\/track\/([a-zA-Z0-9]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

async function processSpotifyTrack(client, message, trackId, loadingMsg) {
  try {
    // Intenta buscar directamente por ID sin usar la API de Spotify
    const query = `https://open.spotify.com/track/${trackId}`;
    return await playTrack(client, message, query, loadingMsg);
  } catch (error) {
    console.error('Error al procesar canción de Spotify:', error);
    await loadingMsg.edit('❌ Error al obtener información de la canción.');
  }
}

async function searchByName(client, message, query, loadingMsg) {
  return await playTrack(client, message, query, loadingMsg);
}

async function playTrack(client, message, query, loadingMsg) {
  try {
    // Create queue
    const queue = await client.player.createQueue(message.guild, {
      metadata: { channel: message.channel },
      leaveOnEmptyCooldown: 60000,
      leaveOnEnd: false,
      leaveOnStop: false,
      ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
      }
    });

    // Connect to voice channel if not already connected
    if (!queue.connection) {
      await queue.connect(message.member.voice.channel);
    }

    // Search for the track
    const searchResult = await client.player.search(query, {
      requestedBy: message.author,
      searchEngine: 'auto',
    });

    // Check if any tracks were found
    if (!searchResult.tracks.length) {
      await loadingMsg.edit(`❌ No se encontró "${query}".`);
      return;
    }

    // Add the first track to the queue and play if not already playing
    const track = searchResult.tracks[0];
    queue.addTrack(track);
    
    if (!queue.playing) {
      await queue.play();
    }

    // Format duration
    const minutes = Math.floor(track.duration / 1000 / 60);
    const seconds = String(Math.floor(track.duration / 1000) % 60).padStart(2, '0');
    
    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#1DB954')
      .setTitle(`▶️ Reproduciendo: ${track.title}`)
      .setDescription(`📀 Artista: ${track.author}
⏱️ Duración: ${minutes}:${seconds}`)
      .setThumbnail(track.thumbnail)
      .setFooter({ text: `Solicitado por ${message.author.tag}` });

    // Edit loading message with embed
    await loadingMsg.edit({ content: null, embeds: [embed] });
  } catch (error) {
    console.error('Error al reproducir la canción:', error);
    await loadingMsg.edit('❌ Ocurrió un error al reproducir la canción.');
  }
}