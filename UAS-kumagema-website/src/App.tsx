import React, { useState, useEffect, useCallback } from 'react';

interface Game {
  id: string;
  title: string;
  genre: string;
  price: number;
  description: string;
  imageUrl?: string; 
}

const COMPANY_NAME = 'KUMAGEMA';
const COMPANY_TAGLINE = 'Menciptakan Dunia Baru, Satu Pixel dalam Satu Waktu.';
const COMPANY_DESC = 
  `KUMAGEMA adalah studio pengembangan game independen yang bersemangat untuk menciptakan pengalaman interaktif yang unik dan mendalam. 
  Kami percaya pada kualitas di atas kuantitas, mendedikasikan diri untuk merancang gameplay yang menarik dan cerita yang tak terlupakan. 
  Jelajahi katalog kami dan temukan petualangan Anda berikutnya!`;
const COMPANY_LOGO_URL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_bskZ5xZEAgZz44CanARP_SzLKPOT9moQQA&s';


const formatPrice = (price: number): string => { 
  if (price <= 0) {
    return "Gratis";
  }
  const formatted = price.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return formatted.replace('IDR', 'Rp'); 
};


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'games'>('home');
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false); 

  useEffect(() => {
    const tailwindScript = document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(tailwindScript);

    tailwindScript.onload = () => {
        const configScript = document.createElement('script');
        configScript.innerHTML = `
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            'kuma-dark': '#1a1a1a', 
                            'kuma-light': '#f5f5f5', 
                            'kuma-accent-cta': '#eab308', 
                            'kuma-accent-cta-hover': '#d97706', 
                        },
                    },
                },
            };
        `;
        document.head.appendChild(configScript);
        
        setTimeout(() => {
            setIsReady(true); 
        }, 150); 
    };

    return () => {
        if (tailwindScript.parentNode) {
            tailwindScript.parentNode.removeChild(tailwindScript);
        }
    };
  }, []);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const API_URL = 'http://localhost:3000/api/games'; 

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Game[] = await response.json();
      setGames(data);
    } catch (err) {
      console.error("Gagal mengambil data dari Express API:", err);
      if (err instanceof TypeError && String(err).includes('Failed to fetch')) {
        setError(`Gagal terhubung. Pastikan Backend (npm start) berjalan dan mengizinkan CORS dari ${window.location.origin}.`);
      } else {
        setError(`Terjadi kesalahan saat fetching data: ${String(err)}`);
      }
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentPage === 'games' || (currentPage === 'home' && games.length === 0)) {
        fetchGames();
    }
  }, [currentPage, fetchGames, games.length]);


  const HomePage: React.FC = () => {
    const recentGames = games.slice(0, 3); 

    return (
      <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8 bg-black rounded-lg shadow-2xl"> 
        <h1 className="text-5xl font-extrabold text-kuma-light tracking-tight text-center"> 
          Selamat Datang di {COMPANY_NAME}
        </h1>
        <p className="text-xl font-medium text-gray-300 text-center italic">
          "{COMPANY_TAGLINE}"
        </p>
        <div className="h-0.5 w-full bg-gray-700 rounded-full my-6"></div>
        
        <section className="text-gray-300">
          <h2 className="3xl font-semibold mb-4 text-kuma-light">
            Tentang Kami
          </h2>
          <p className="text-lg leading-relaxed">
            {COMPANY_DESC}
          </p>
        </section>

        {recentGames.length > 0 && (
          <section className="pt-8">
            <h2 className="text-3xl font-semibold mb-6 text-kuma-light text-center">
              Lihat Games Kami!
            </h2>
            <div className="flex justify-center"> 
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:max-w-xl">
                  {recentGames.map((game) => (
                    <HomeGameCard key={game.id} game={game} />
                  ))}
                </div>
            </div>
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setCurrentPage('games')}
                className="px-8 py-3 bg-kuma-accent-cta text-kuma-dark text-lg font-bold rounded-full shadow-lg hover:bg-kuma-accent-cta-hover transition duration-300 transform hover:scale-105"
              >
                Lihat Semua Game Lain
              </button>
            </div>
          </section>
        )}

        {recentGames.length === 0 && !isLoading && !error && (
            <div className="flex justify-center pt-4">
                <button
                    onClick={() => setCurrentPage('games')}
                    className="px-8 py-3 bg-kuma-accent-cta text-kuma-dark text-lg font-bold rounded-full shadow-lg hover:bg-kuma-accent-cta-hover transition duration-300 transform hover:scale-105"
                >
                    Lihat Katalog Game
                </button>
            </div>
        )}

        {(isLoading && games.length === 0) && ( 
             <div className="text-center p-10 text-gray-400">
                <svg className="animate-spin h-8 w-8 text-kuma-accent-cta mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Memuat game terbaru...</p>
            </div>
        )}
        {error && currentPage === 'home' && (
            <div className="p-4 bg-red-800/50 border border-red-500 rounded-lg text-white text-center">
                <p>{error}</p>
            </div>
        )}
      </div>
    );
  };

  const GameCatalog: React.FC = () => {
    if (isLoading) {
      return (
        <div className="text-center p-10 text-kuma-light">
          <svg className="animate-spin h-8 w-8 text-kuma-accent-cta mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Memuat data game dari Express.js API...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 max-w-xl mx-auto bg-red-800/50 border border-red-500 rounded-xl text-kuma-light shadow-xl">
          <h3 className="text-2xl font-bold mb-3 text-red-300">Koneksi Backend Gagal!</h3>
          <p className="mb-4">{error}</p>
          <p className="text-sm">Pastikan server backend Anda (npm start) sedang berjalan dan CORS sudah diatur dengan benar.</p>
        </div>
      );
    }

    if (games.length === 0) {
      return (
        <div className="text-center p-10 text-gray-400 max-w-md mx-auto">
          <h3 className="text-2xl font-bold mb-3">Katalog Kosong</h3>
          <p>Database kosong atau server mengembalikan array kosong. Silakan isi data menggunakan `npm run studio` di terminal backend Anda.</p>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-8">
        <h2 className="text-4xl font-bold mb-8 text-kuma-light text-center">
          Katalog Game KUMAGEMA
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    );
  };

  const HomeGameCard: React.FC<{ game: Game }> = ({ game }) => (
    <div className="bg-black rounded-xl shadow-lg overflow-hidden transition duration-300 hover:shadow-kuma-accent-cta/50 hover:scale-[1.05] cursor-pointer border border-gray-700"> 
      <div className="h-40 overflow-hidden">
        <img
          src={game.imageUrl || 'https://placehold.co/600x400/374151/ffffff?text=KUMAGEMA'}
          alt={`Cover image of ${game.title}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://placehold.co/600x400/374151/ffffff?text=KUMAGEMA';
          }}
        />
      </div>
      <div className="p-4 text-center">
        <h3 className="text-xl font-bold text-kuma-light truncate">{game.title}</h3>
      </div>
    </div>
  );

  const GameCard: React.FC<{ game: Game }> = ({ game }) => (
    <div className="bg-black rounded-xl shadow-lg overflow-hidden transition duration-300 hover:shadow-kuma-accent-cta/50 hover:scale-[1.02] border border-gray-700"> 
      <div className="h-48 overflow-hidden">
        <img
          src={game.imageUrl || 'https://placehold.co/600x400/374155/ffffff?text=KUMAGEMA'}
          alt={`Cover image of ${game.title}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://placehold.co/600x400/374155/ffffff?text=KUMAGEMA';
          }}
        />
      </div>
      <div className="p-6 space-y-4">
        <h3 className="2xl font-bold text-kuma-light">{game.title}</h3>
        <span className="inline-block bg-gray-700 text-gray-200 text-xs font-semibold px-3 py-1 rounded-full">{game.genre}</span>
        <p className="text-gray-400 text-sm line-clamp-3">{game.description}</p>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-700 mt-4">
          <span className={`text-3xl font-extrabold ${game.price > 0 ? 'text-kuma-accent-cta' : 'text-green-500'}`}>
            {formatPrice(game.price)}
          </span>
          <button
            onClick={() => console.log(`Attempting to buy ${game.title}`)} 
            className="px-4 py-2 bg-kuma-accent-cta text-kuma-dark font-semibold rounded-lg shadow-md hover:bg-kuma-accent-cta-hover transition duration-200"
          >
            {game.price > 0 ? 'Beli Sekarang' : 'Dapatkan'}
          </button>
        </div>
      </div>
    </div>
  );
  

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'games':
        return <GameCatalog />;
      default:
        return <HomePage />;
    }
  };
  
  if (!isReady) {
    return (
      <div 
        style={{ 
          backgroundColor: '#1a1a1a', 
          width: '100vw', 
          height: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          color: '#f5f5f5', 
          fontSize: '24px' 
        }} 
      >
        Memuat Tampilan...
      </div>
    );
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body, #root { 
              height: 100%; 
              width: 100%; 
              margin: 0; 
              padding: 0;
              font-family: sans-serif;
            }
          `,
        }}
      />
      <div className="min-h-screen bg-kuma-dark font-sans text-kuma-light">
        <header className="bg-black shadow-md sticky top-0 z-10"> 
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3"> 
              <img src={COMPANY_LOGO_URL} alt="KUMAGEMA Logo" className="h-8 w-8" /> 
              <div className="text-2xl font-bold text-kuma-light tracking-wider">
                {COMPANY_NAME}
              </div>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => setCurrentPage('home')}
                className={`font-semibold transition duration-150 ${
                  currentPage === 'home' ? 'text-kuma-accent-cta border-b-2 border-kuma-accent-cta' : 'text-gray-300 hover:text-kuma-accent-cta'
                }`}
              >
                Beranda
              </button>
              <button
                onClick={() => setCurrentPage('games')}
                className={`font-semibold transition duration-150 ${
                  currentPage === 'games' ? 'text-kuma-accent-cta border-b-2 border-kuma-accent-cta' : 'text-gray-300 hover:text-kuma-accent-cta'
                }`}
              >
                Games
              </button>
            </div>
          </nav>
        </header>

        <main className="py-10">
          {renderPage()}
        </main>

        <footer className="bg-black border-t border-gray-700 mt-10"> 
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
            &copy; {new Date().getFullYear()} {COMPANY_NAME}. All Rights Reserved. 
          </div>
        </footer>
      </div>
    </>
  );
};

export default App;
