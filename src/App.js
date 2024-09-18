import React, { useState, useEffect, useRef } from 'react';

// Componente para Header
const Header = ({ onRefresh }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-300">
      <h2 className="font-bold text-lg">Asistente Virtual</h2>
      <button
        className="text-sm font-semibold text-blue-600 bg-blue-50 px-7 py-1 rounded hover:bg-blue-100"
        onClick={onRefresh}
      >
        Refresh
      </button>
    </div>
  );
};

// Componente para Chat Bubble
const ChatBubble = ({ message, time, sender }) => {
  const isUser = sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
      <div className={`${isUser ? 'bg-pink-500 text-white' : 'bg-gray-200 text-black'} px-4 py-2 rounded-lg max-w-xs shadow-md`}>
        <p className="text-sm">{message}</p>
        <span className="text-xs text-gray-400 mt-1 block">{time}</span>
      </div>
    </div>
  );
};

// Componente para los botones de opciones
const Options = ({ options, onOptionClick }) => {
  return (
    <div className="flex flex-col items-start mb-4 px-4">
      <p className="text-gray-500 text-sm mb-2">Elige una opción:</p> {/* Texto sobre las opciones */}
      <div className="flex flex-wrap items-start">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onOptionClick(option)}
            className="border border-blue-500 text-blue-500 px-4 py-2 rounded-lg mb-2 mr-2 hover:bg-blue-100"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente para Entrada de Texto
const TextInput = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue(''); // Limpiar el campo de entrada
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex mb-4 px-4">
      <input 
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
        placeholder="Escribe tu respuesta aquí..."
      />
      <button 
        type="submit"
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Enviar
      </button>
    </form>
  );
};

function App() {
  const initialMessages = [
    {
      message: 'Hola, soy el Asistente Virtual de la biblioteca. ¿En qué te puedo ayudar?',
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: ['Preguntas sobre la biblioteca', 'Búsqueda de un documento o libro'],
    },
  ];

  const responseMap = {
    'Preguntas sobre la biblioteca': {
      message: 'Puedes preguntarme sobre los siguientes temas:',
      options: ['Horario', 'Ubicación', 'Servicios'],
    },
    'Búsqueda de un documento o libro': {
      message: '¿Qué tipo de documento o libro estás buscando? Puedes darme un título, autor o tema.',
      inputRequired: true, // Este campo indica que se requiere una respuesta del usuario
    },
    'Horario': {
      message: 'La biblioteca está abierta de 8 AM a 10 PM todos los días.',
      followUpMessages: [
        { message: '¿Qué más necesitas?', options: ['Preguntas sobre la biblioteca', 'Búsqueda de un documento o libro'] },
      ],
    },
    'Ubicación': {
      message: 'La biblioteca está ubicada en el edificio principal de la universidad.',
    },
    'Servicios': {
      message: 'Ofrecemos servicios de préstamo, consulta en sala, y acceso a recursos digitales.',
    },
  };

  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [awaitingInput, setAwaitingInput] = useState(false); // Estado para saber si esperamos una entrada de texto del usuario
  const chatContainerRef = useRef(null); // Ref para el contenedor del chat

  // UseEffect para hacer scroll al último mensaje cada vez que cambien los mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOptionClick = (option) => {
    const newMessages = [
      ...messages,
      { message: option, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ];

    const botResponse = responseMap[option];
    
    if (botResponse) {
      // Siempre agregamos el mensaje del bot al chat antes de solicitar la entrada
      setMessages([
        ...newMessages,
        {
          message: botResponse.message,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: botResponse.options || null,
        },
      ]);

      // Si hay follow-up messages, los añadimos con un retraso
      if (botResponse.followUpMessages) {
        botResponse.followUpMessages.forEach((followUp, index) => {
          setTimeout(() => {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                message: followUp.message,
                sender: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                options: followUp.options || null,
              },
            ]);
          }, 2000 * (index + 1)); // Añadimos un retraso de 2 segundos por cada mensaje siguiente
        });
      }

      // Si la respuesta requiere entrada del usuario, habilitamos el estado `awaitingInput`
      if (botResponse.inputRequired) {
        setAwaitingInput(true);
      }
    }
  };

  const handleUserInputSubmit = (userInput) => {
    const newMessages = [
      ...messages,
      { message: userInput, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ];

    // Continuamos con una respuesta genérica o lógica adicional después de recibir la entrada
    const botResponse = "Gracias por la información, estoy buscando más detalles...";
    setMessages([
      ...newMessages,
      { message: botResponse, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    
    setAwaitingInput(false); // Reiniciamos el estado para que el cuadro de texto desaparezca
  };

  // Función para refrescar el chat y volver al estado inicial
  const handleRefresh = () => {
    setMessages(initialMessages);
    setAwaitingInput(false);
  };

  return (
    <div className="h-screen relative">
      {!isChatVisible && (
        <button 
          onClick={() => setIsChatVisible(true)} 
          className="fixed bottom-4 right-4 p-4 rounded-full shadow-lg bg-blue-500 transition-transform transform hover:scale-110 hover:bg-blue-700"
        >
          IA
        </button>
      )}

      {isChatVisible && (
        <div className="fixed bottom-20 right-4 w-80 shadow-2xl border rounded-lg overflow-hidden bg-white">
          <Header onRefresh={handleRefresh} />
          <div className="bg-gray-50 h-96 overflow-y-scroll" ref={chatContainerRef}>
            {messages.map((msg, idx) => (
              <div key={idx}>
                <ChatBubble message={msg.message} time={msg.time} sender={msg.sender} />
                {msg.options && !awaitingInput && (
                  <Options options={msg.options} onOptionClick={(option) => {
                    handleOptionClick(option);
                    const updatedMessages = [...messages];
                    updatedMessages[idx].options = null;
                    //setMessages(updatedMessages);
                  }} />
                )}
              </div>
            ))}

            {/* Mostrar el cuadro de entrada de texto si se requiere */}
            {awaitingInput && <TextInput onSubmit={handleUserInputSubmit} />}
          </div>

          <button 
            onClick={() => setIsChatVisible(false)} 
            className="absolute top-2 right-4 text-black-400 hover:text-gray-600"
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
