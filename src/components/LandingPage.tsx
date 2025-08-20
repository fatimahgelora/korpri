import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, Clock, Phone, Mail, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const { admin } = useAdminAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleAdminClick = () => {
    if (admin) {
      // Jika sudah login sebagai admin, langsung ke dashboard
      navigate('/admin/dashboard');
    } else {
      // Jika belum login, ke halaman login admin
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Swiss minimal */}
      <nav className="fixed top-0 w-full bg-white z-50 border-b border-blue-300">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-2xl font-light tracking-wide text-black">
              KORPRI RUN
            </div>
            <div className="hidden md:flex space-x-12 text-sm font-light tracking-wide">
              <a href="#home" className="text-black hover:text-blue-600 transition-colors">HOME</a>
              <a href="#about" className="text-black hover:text-blue-600 transition-colors">ABOUT</a>
              <a href="#schedule" className="text-black hover:text-blue-600 transition-colors">SCHEDULE</a>
              <a href="#contact" className="text-black hover:text-blue-600 transition-colors">CONTACT</a>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="border border-blue-600 text-blue-600 px-8 py-3 text-sm font-light tracking-wide hover:bg-blue-600 hover:text-white transition-colors"
              >
                LOGIN
              </button>
              <button 
                onClick={handleRegisterClick}
                className="bg-blue-500 text-white px-8 py-3 text-sm font-light tracking-wide hover:bg-blue-700 transition-colors"
              >
                REGISTER
              </button>
              <button 
                onClick={handleAdminClick}
                className="border border-gray-400 text-gray-600 px-6 py-3 text-xs font-light tracking-wide hover:border-gray-600 hover:text-black transition-colors"
              >
                {admin ? 'ADMIN DASHBOARD' : 'ADMIN'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax - Swiss Typography */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-100">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 bg-blue-500"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        <div 
          className="absolute inset-0 bg-black/20"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        
        {/* Hero Content - Swiss Grid */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-8">
          <div
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          >
            <div className="text-8xl md:text-9xl font-light tracking-tighter mb-4 leading-none">
              2025
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-widest mb-8 uppercase">
              Korpri Run
            </h1>
            <div className="w-24 h-px bg-white mx-auto mb-8"></div>
            <p className="text-lg font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              15 MARET 2025 — JAKARTA
            </p>
          </div>
        </div>
      </section>

      {/* About Section - Swiss Grid */}
      <section id="about" className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4">
              <h2 className="text-4xl font-light tracking-tight text-black mb-8">
                About the Event
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8">
              <div className="space-y-8">
                <p className="text-lg font-light leading-relaxed text-gray-800">
                  KORPRI RUN 2025 adalah acara lari tahunan yang menghubungkan pegawai negeri 
                  di seluruh Indonesia dalam semangat persatuan dan kesehatan.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div>
                    <div className="text-3xl font-light text-blue-600 mb-2">5,000+</div>
                    <div className="text-sm font-light tracking-wide uppercase text-gray-600">Participants</div>
                  </div>
                  <div>
                    <div className="text-3xl font-light text-blue-600 mb-2">42K</div>
                    <div className="text-sm font-light tracking-wide uppercase text-gray-600">Maximum Distance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Swiss Minimal */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-12 md:col-span-4">
              <h2 className="text-4xl font-light tracking-tight text-black">
                Categories
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8">
              <p className="text-lg font-light leading-relaxed text-gray-800">
                Pilih kategori yang sesuai dengan kemampuan dan pengalaman lari Anda.
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            {[
              { name: "Fun Run", distance: "5K", price: "150.000", desc: "Untuk pemula dan keluarga" },
              { name: "Half Marathon", distance: "21K", price: "250.000", desc: "Tantangan menengah" },
              { name: "Full Marathon", distance: "42K", price: "350.000", desc: "Untuk pelari berpengalaman" }
            ].map((category, index) => (
              <div 
                key={index}
                className="group border-b border-blue-300 py-8 hover:bg-white transition-colors cursor-pointer"
              >
                <div className="grid grid-cols-12 gap-8 items-center">
                  <div className="col-span-12 md:col-span-3">
                    <div className="text-2xl font-light text-black">{category.name}</div>
                    <div className="text-sm font-light tracking-wide uppercase text-gray-600">{category.distance}</div>
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <div className="text-lg font-light text-gray-800">{category.desc}</div>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <div className="text-xl font-light text-blue-600">Rp {category.price}</div>
                  </div>
                  <div className="col-span-12 md:col-span-1">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section - Swiss Typography */}
      <section id="schedule" className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-12 md:col-span-4">
              <h2 className="text-4xl font-light tracking-tight text-black">
                Schedule
              </h2>
              <div className="mt-4 text-sm font-light tracking-wide uppercase text-gray-600">
                15 Maret 2025
              </div>
            </div>
            <div className="col-span-12 md:col-span-8">
              <div className="space-y-6">
                {[
                  { time: "05:00", event: "Registrasi & Check-in" },
                  { time: "06:00", event: "Start Fun Run 5K" },
                  { time: "06:30", event: "Start Half Marathon 21K" },
                  { time: "07:00", event: "Start Full Marathon 42K" },
                  { time: "12:00", event: "Penutupan & Pengumuman Pemenang" }
                ].map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-8 py-4 border-b border-blue-300">
                    <div className="col-span-3 md:col-span-2">
                      <div className="text-lg font-light text-blue-600">{item.time}</div>
                    </div>
                    <div className="col-span-9 md:col-span-10">
                      <div className="text-lg font-light text-gray-800">{item.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration CTA - Swiss Minimal */}
      <section className="py-32 bg-blue-500">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-light tracking-tight text-white mb-8">
              Register Now
            </h2>
            <div className="w-24 h-px bg-white mx-auto mb-8"></div>
            <p className="text-lg font-light text-white/90 mb-12 leading-relaxed">
              Bergabunglah dengan ribuan pegawai negeri dalam event lari terbesar tahun ini.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12 text-white">
              <div className="py-8">
                <div className="text-2xl font-light mb-2">Early Bird</div>
                <div className="text-sm font-light tracking-wide uppercase opacity-75">Sampai 31 Jan</div>
                <div className="text-lg font-light mt-2">25% Diskon</div>
              </div>
              <div className="py-8 border-l border-r border-white/20">
                <div className="text-2xl font-light mb-2">Regular</div>
                <div className="text-sm font-light tracking-wide uppercase opacity-75">1 Feb - 28 Feb</div>
                <div className="text-lg font-light mt-2">Harga Normal</div>
              </div>
              <div className="py-8">
                <div className="text-2xl font-light mb-2">Last Call</div>
                <div className="text-sm font-light tracking-wide uppercase opacity-75">1 Mar - 10 Mar</div>
                <div className="text-lg font-light mt-2">+10% Harga</div>
              </div>
            </div>
            <button 
              onClick={handleRegisterClick}
              className="bg-white text-blue-600 px-12 py-4 text-sm font-light tracking-wide hover:bg-gray-100 transition-colors"
            >
              REGISTER NOW
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section - Swiss Grid */}
      <section id="contact" className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4">
              <h2 className="text-4xl font-light tracking-tight text-black mb-8">
                Contact
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-2">Phone</div>
                    <div className="text-lg font-light text-gray-800">+62 21 1234 5678</div>
                  </div>
                  <div>
                    <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-2">Email</div>
                    <div className="text-lg font-light text-gray-800">info@korprirun.id</div>
                  </div>
                  <div>
                    <div className="text-sm font-light tracking-wide uppercase text-gray-600 mb-2">Address</div>
                    <div className="text-lg font-light text-gray-800">Gedung BKN<br />Jakarta Pusat</div>
                  </div>
                </div>
                <div>
                  <form className="space-y-6">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Name"
                        className="w-full px-0 py-4 border-0 border-b border-blue-300 focus:border-blue-600 focus:ring-0 bg-transparent text-lg font-light placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        placeholder="Email"
                        className="w-full px-0 py-4 border-0 border-b border-blue-300 focus:border-blue-600 focus:ring-0 bg-transparent text-lg font-light placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <textarea 
                        rows={4} 
                        placeholder="Message"
                        className="w-full px-0 py-4 border-0 border-b border-blue-300 focus:border-blue-600 focus:ring-0 bg-transparent text-lg font-light placeholder-gray-400 resize-none"
                      ></textarea>
                    </div>
                    <button className="bg-blue-500 text-white px-8 py-3 text-sm font-light tracking-wide hover:bg-blue-700 transition-colors">
                      SEND MESSAGE
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Swiss Minimal */}
      <footer className="py-16 bg-gray-50 border-t border-blue-300">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-lg font-light tracking-wide text-black mb-4 md:mb-0">
              KORPRI RUN 2025
            </div>
            <div className="text-sm font-light text-gray-600">
              2025 All rights reserved
              © 2025 All rights reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;