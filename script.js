const aliasInput = document.getElementById("alias");
const formatSelect = document.getElementById("topic");
const joinForm = document.getElementById("join-form");
const joinButton = document.getElementById("join");
const watchButton = document.getElementById("watch");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send");
const messages = document.getElementById("messages");
const status = document.getElementById("status");
const roomTitle = document.getElementById("chat-title");
const roomMode = document.getElementById("room-mode");

const artistOne = document.getElementById("artist-one");
const roleOne = document.getElementById("role-one");
const artistTwo = document.getElementById("artist-two");
const roleTwo = document.getElementById("role-two");

const formats = {
  music: {
    title: "Duelo de canto",
    role: "Vocalista",
    prompt: "Interpreta un coro con tu propio estilo.",
    profiles: [
      {
        name: "Luna",
        role: "Cantautora",
        greeting: "¡Wepa! Yo voy con un coro original. ¿Qué vas a cantar tú?",
        replies: [
          "¿Cómo quieres que suene tu interpretación: suave o con más fuerza?",
          "Yo voy a dejar el primer verso a capela y entrar con todo en el coro.",
          "¿Qué parte de la canción quieres que el público recuerde?"
        ]
      },
      {
        name: "Nox",
        role: "Vocalista",
        greeting: "Voy a cantar un cover con otro ritmo. ¿Tú tienes un cover o un tema tuyo?",
        replies: [
          "¿Cambiarías el ritmo de la canción o trabajarías la melodía?",
          "Yo voy a hacer mi versión más lenta para que se entienda cada línea.",
          "¿Qué harías distinto en el último coro?"
        ]
      }
    ],
    preview: [
      "Voy a cantar el coro a capela para que se escuche bien la letra.",
      "Yo voy con el mismo coro, pero con una melodía más suave.",
      "Dale, empezamos con tu versión y después voy yo."
    ]
  },

  art: {
    title: "VS de arte visual",
    role: "Artista visual",
    prompt: "Diseña una portada para un disco llamado Después de medianoche.",
    profiles: [
      {
        name: "Nova",
        role: "Ilustradora",
        greeting: "Mi portada va a ser una ciudad de noche. ¿Qué vas a poner en la tuya?",
        replies: [
          "¿Qué colores vas a usar para darle ambiente?",
          "Voy a probar un reflejo en la calle para darle profundidad a la escena.",
          "¿Dónde pondrías el título para que se lea desde el celular?"
        ]
      },
      {
        name: "Pixel",
        role: "Diseñador visual",
        greeting: "Voy con una portada minimalista. ¿La tuya lleva foto o ilustración?",
        replies: [
          "¿Qué elemento quieres que llame la atención primero?",
          "Estoy probando una tipografía plateada sobre un fondo oscuro.",
          "¿Cómo se vería tu portada en miniatura?"
        ]
      }
    ],
    preview: [
      "Mi portada tiene una ciudad vacía y un solo letrero encendido.",
      "La mía es más sencilla. Voy a usar una silueta y un título plateado.",
      "Cuando terminemos, vamos a comparar cómo se ven las dos en miniatura."
    ]
  }
};

let currentMatch = null;
let replyTimer = null;

function addMessage(author, text, own = false) {
  const bubble = document.createElement("div");
  const name = document.createElement("strong");

  bubble.className = own ? "bubble own" : "bubble";
  name.textContent = author;

  bubble.append(name, document.createTextNode(text));
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function renderRoom(format, firstArtist, secondArtist) {
  clearTimeout(replyTimer);
  replyTimer = null;

  roomTitle.textContent = format.title;
  roomMode.textContent = currentMatch ? "Participante" : "Espectador";

  artistOne.textContent = firstArtist.name;
  roleOne.textContent = firstArtist.role;
  artistTwo.textContent = secondArtist.name;
  roleTwo.textContent = secondArtist.role;

  const isWatching = currentMatch === null;

  messageInput.disabled = isWatching;
  sendButton.disabled = isWatching;
  watchButton.disabled = isWatching;
  joinButton.textContent = isWatching
    ? "Buscar artista al azar"
    : "Buscar otro artista";

  messageInput.value = "";
  messages.replaceChildren();

  addMessage("Creatstudio", `Reto: ${format.prompt}`);
}

function watchRoom() {
  currentMatch = null;

  const format = formats[formatSelect.value];
  const [firstArtist, secondArtist] = format.profiles;

  renderRoom(format, firstArtist, secondArtist);

  addMessage(firstArtist.name, format.preview[0]);
  addMessage(secondArtist.name, format.preview[1]);
  addMessage(firstArtist.name, format.preview[2]);

  status.textContent = "Estás viendo un encuentro de ejemplo.";
}

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const format = formats[formatSelect.value];
  const candidates = format.profiles.filter(
    (profile) => profile !== currentMatch?.opponent
  );
  const randomIndex = Math.floor(Math.random() * candidates.length);
  const opponent = candidates[randomIndex];

  const artist = {
    name: aliasInput.value.trim().slice(0, 24) || "Tú",
    role: format.role
  };

  currentMatch = { artist, opponent, nextReply: 0 };

  renderRoom(format, artist, opponent);
  addMessage(opponent.name, opponent.greeting);

  status.textContent = `Encuentro simulado con ${opponent.name}.`;
  messageInput.focus();
});

formatSelect.addEventListener("change", () => {
  if (currentMatch) {
    status.textContent = "Presiona «Buscar otro artista» para cambiar de formato.";
    return;
  }

  watchRoom();
});

watchButton.addEventListener("click", () => {
  watchRoom();
  joinButton.focus();
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = messageInput.value.trim().slice(0, 280);
  if (!currentMatch || !text) return;

  const match = currentMatch;

  addMessage(match.artist.name, text, true);
  messageInput.value = "";
  messageInput.focus();

  if (replyTimer !== null) return;
  if (match.nextReply >= match.opponent.replies.length) return;

  status.textContent = `${match.opponent.name} está escribiendo…`;

  replyTimer = setTimeout(() => {
    replyTimer = null;

    addMessage(match.opponent.name, match.opponent.replies[match.nextReply]);
    match.nextReply += 1;

    status.textContent = match.nextReply === match.opponent.replies.length
      ? "Terminó la conversación de ejemplo. Puedes buscar otro artista."
      : `Encuentro simulado con ${match.opponent.name}.`;
  }, 800);
});

watchRoom();
