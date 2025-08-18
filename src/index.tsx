import React, { useState, useEffect } from 'react';

// TypeScript interfaces
interface RegistrationForm {
  name: string;
  email: string;
  age: string;
  gender: string;
  message: string;
  agreeToTerms: boolean;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: string;
}

interface NewsItem {
  id: string;
  title: string;
  date: string;
  month: string;
  content: string;
  thumbnail: string;
  comments: number;
}

const MarathonLanding: React.FC = () => {
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    name: '',
    email: '',
    age: '',
    gender: '',
    message: '',
    agreeToTerms: false
  });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown timer effect
  useEffect(() => {
    const targetDate = new Date('2024-12-27T00:00:00').getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Inisialisasi Slick Slider & animasi untuk hero, sponsor, news
  useEffect(() => {
    const interval = setInterval(() => {
      const $ = (window as any).$;
      const Parallax = (window as any).Parallax;
      if ($ && $.fn && $.fn.slick) {
        // Hero Slider (.marathon-slider)
        if ($('.marathon-slider').length && !$('.marathon-slider').hasClass('slick-initialized')) {
          $('.marathon-slider').slick({
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            arrows: false,
            speed: 1000,
            fade: true,
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            touchThreshold: 100,
            autoplay: true,
            autoplaySpeed: 4500,
            lazyLoad: 'progressive',
            draggable: true,
            responsive: [
              {
                breakpoint: 1200,
                settings: { dots: false }
              }
            ]
          });
        }
        // Parallax animasi gambar marathon
        if (Parallax && $('.scene').length && !$('.scene').data('parallax-initialized')) {
          $('.scene').each(function (_: any, el: any) {
            new Parallax(el);
            $(el).data('parallax-initialized', true);
          });
        }
        // Slick Sponsor
        if ($('.clients-cover').length && !$('.clients-cover').hasClass('slick-initialized')) {
          $('.clients-cover').slick({
            infinite: true,
            slidesToShow: 5,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            arrows: false,
            dots: false,
            responsive: [
              { breakpoint: 1200, settings: { slidesToShow: 3 } },
              { breakpoint: 768, settings: { slidesToShow: 2 } },
              { breakpoint: 480, settings: { slidesToShow: 1 } }
            ]
          });
        }
        // Slick News
        if ($('.marathon-news-slider').length && !$('.marathon-news-slider').hasClass('slick-initialized')) {
          $('.marathon-news-slider').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            arrows: true,
            speed: 800,
            touchThreshold: 200,
            cssEase: 'ease',
            nextArrow: '<span class="slick-arrow-next"><i class="fa fa-angle-right" aria-hidden="true"></i></span>',
            prevArrow: '<span class="slick-arrow-prev"><i class="fa fa-angle-left" aria-hidden="true"></i></span>',
            autoplay: true,
            autoplaySpeed: 4500,
            dots: false,
            responsive: [
              { breakpoint: 1200, settings: { slidesToShow: 3 } },
              { breakpoint: 768, settings: { slidesToShow: 2 } },
              { breakpoint: 576, settings: { fade: true, slidesToShow: 1 } }
            ]
          });
        }
        // Isotope
        if ((window as any).Isotope && $('.grid').length && !($('.grid').data('isotope'))) {
          $('.grid').isotope({
            itemSelector: '.grid-item',
            layoutMode: 'fitRows'
          });
        }
        // Fancybox
        if ($.fancybox && $('[data-fancybox]').length) {
          $('[data-fancybox]').fancybox();
        }
        // Scrolly
        if ($.fn.scrolly && $('[data-scrolly]').length) {
          $('[data-scrolly]').scrolly();
        }
        // WOW.js
        if ((window as any).WOW) {
          new (window as any).WOW().init();
        }
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Sample data
  const scheduleItems: ScheduleItem[] = [
    {
      id: '1',
      time: '9:00 - 11:00',
      title: 'Excepteur sint occaecat cupidatat',
      description: 'At vero eos et accusamus et iusto odio dignissimos ducimus blanditiis praesentium volup',
      icon: '/img/event-icon-1.svg'
    },
    {
      id: '2',
      time: '11:00 - 13:00',
      title: 'Sed ut perspiciatis unde omnis',
      description: 'At vero eos et accusamus et iusto odio dignissimos ducimus blanditiis praesentium volup',
      icon: '/img/event-icon-2.svg'
    },
    {
      id: '3',
      time: '13:00 - 14:00',
      title: 'Ut enim ad minima veniam, quis',
      description: 'At vero eos et accusamus et iusto odio dignissimos ducimus blanditiis praesentium volup',
      icon: '/img/event-icon-3.svg'
    },
    {
      id: '4',
      time: '14:00 - 15:00',
      title: 'Quis autem vel eum iure reprehend',
      description: 'At vero eos et accusamus et iusto odio dignissimos ducimus blanditiis praesentium volup',
      icon: '/img/event-icon-4.svg'
    }
  ];

  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Sed ut perspiciatis unde omnis iste natus error sit',
      date: '10, 2020',
      month: 'March',
      content: 'Сonsectetur adipiscing elit, sed do eiusmod tempor',
      thumbnail: '/img/post-1-home-1.jpg',
      comments: 0
    },
    {
      id: '2',
      title: 'It has survived not only five centuries',
      date: '15, 2020',
      month: 'April',
      content: 'Many desktop publishing packages and web page',
      thumbnail: '/img/post-2-home-1.jpg',
      comments: 0
    },
    {
      id: '3',
      title: 'But I must explain to you how all this mistaken idea',
      date: '25, 2020',
      month: 'June',
      content: 'Various versions have evolved over the years',
      thumbnail: '/img/post-3-home-1.jpg',
      comments: 0
    }
  ];

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration submitted:', registrationForm);
    // Handle registration logic here
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', newsletterEmail);
    setNewsletterEmail('');
  };

  const handleInputChange = (field: keyof RegistrationForm, value: string | boolean) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="marathon-landing" id="home">
      {/* Preloader */}
      <div className="page-preloader-cover">
        <div className="cssload-loader">
          <div className="cssload-inner cssload-one"></div>
          <div className="cssload-inner cssload-two"></div>
          <div className="cssload-inner cssload-three"></div>
        </div>
      </div>

      {/* Background Effect */}
      <span className="bg-effect" style={{backgroundImage: 'url(./img/main-bg.svg)'}}></span>

      {/* Header */}
      <header className="marathon-header-fixed header-fixed">
        <a href="#" className="nav-btn">
          <span></span>
          <span></span>
          <span></span>
        </a>
        <div className="top-panel">
          <div className="container">
            <a href="/" className="logo">
              <img src="/img/logo-white.svg" alt="logo" />
            </a>
            <ul className="social-list">
              <li><a target="_blank" href="https://www.facebook.com/rovadex"><i className="fab fa-facebook-f"></i></a></li>
              <li><a target="_blank" href="https://twitter.com/RovadexStudio"><i className="fab fa-twitter"></i></a></li>
              <li><a target="_blank" href="https://www.instagram.com/rovadex"><i className="fab fa-instagram"></i></a></li>
              <li><a target="_blank" href="https://www.youtube.com"><i className="fab fa-youtube"></i></a></li>
            </ul>
          </div>
        </div>
        <div className="header-nav">
          <div className="container">
            <div className="header-nav-cover">
              <nav className="nav-menu menu">
                <ul className="nav-list">
                  <li className="dropdown active-page">
                    <a href="#">home <i className="fa fa-angle-down" aria-hidden="true"></i></a>
                    <ul>
                      <li className="active-page"><a href="/">Home Marathon</a></li>
                      <li><a href="/conference">Home Conference</a></li>
                      <li><a href="/dance">Home Dance</a></li>
                    </ul>
                  </li>
                  <li><a href="#about">about us</a></li>
                  <li><a href="#schedule">schedule</a></li>
                  <li><a href="#location">location</a></li>
                  <li><a href="#register">register</a></li>
                  <li><a href="#news">news</a></li>
                  <li className="dropdown">
                    <a href="#">pages <i className="fa fa-angle-down" aria-hidden="true"></i></a>
                    <ul>
                      <li><a href="/conference-team">Conference Team</a></li>
                      <li><a href="/dance-team">Dance Team</a></li>
                      <li><a href="/blog">Blog</a></li>
                      <li><a href="/404">Page Error 404</a></li>
                    </ul>
                  </li>
                </ul>
              </nav>
              <a href="#register" className="btn btn-white"><span>registration</span></a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Slider */}
      <section className="s-marathon-slider">
        <div className="marathon-slider">
          <div className="marathon-slide marathon-slide-1">
            <div className="scene">
              <div className="scene-item">
                <span className="marathon-effect" style={{backgroundImage: 'url(/img/effect-slider-marathon.svg)'}}></span>
              </div>
              <div className="scene-item">
                <img className="marathon-img" src="/img/slider-1.png" alt="runner" />
              </div>
              <div className="scene-item">
                <div className="slider-location">
                  San Francisco <br />marathon <span className="date">27 dec 2019</span>
                </div>
              </div>
              <div className="scene-item">
                <div className="marathon-text-left">find<br />your</div>
              </div>
              <div className="scene-item">
                <div className="marathon-text-right">Fast</div>
              </div>
            </div>
          </div>
        </div>
        <img className="marathon-slider-shape" src="/img/slider-home1-shape.svg" alt="shape" />
        
        {/* Countdown Timer */}
        <div id="clockdiv" className="clock-timer clock-timer-marathon">
          <div className="days-item">
            <img src="/img/counter-1.svg" alt="days" />
            <span className="days">{countdown.days}</span>
            <div className="smalltext">Days</div>
          </div>
          <div className="hours-item">
            <img src="/img/counter-2.svg" alt="hours" />
            <span className="hours">{countdown.hours}</span>
            <div className="smalltext">Hours</div>
          </div>
          <div className="minutes-item">
            <img src="/img/counter-3.svg" alt="minutes" />
            <span className="minutes">{countdown.minutes}</span>
            <div className="smalltext">Minutes</div>
          </div>
          <div className="seconds-item">
            <img src="/img/counter-4.svg" alt="seconds" />
            <span className="seconds">{countdown.seconds}</span>
            <div className="smalltext">Seconds</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="s-our-mission">
        <div className="container">
          <img className="mission-effect" src="/img/our-mission-5.svg" alt="effect" />
          <h2 className="title">Our mission</h2>
          <div className="row">
            <div className="col-lg-6 our-mission-img">
              <span>
                <img className="mission-img-effect-1" src="/img/our-mission-2.svg" alt="effect" />
                <img className="mission-img" src="/img/our-mission.jpg" alt="mission" />
                <img className="mission-img-effect-4" src="/img/tringle-gray-little.svg" alt="effect" />
              </span>
            </div>
            <div className="col-lg-6 our-mission-info">
              <ul className="mission-meta">
                <li><i className="fas fa-map-marker-alt"></i>London</li>
                <li><i className="fas fa-calendar-alt"></i>31.10.2019</li>
              </ul>
              <h4>Od tempor incididunt ut labore aliqua. ullamco laboris nisi ut aliquip</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusm od tempor incididunt ut labore et dolore magna aliqua. Ut enim minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip</p>
              <div className="mission-number-cover">
                <div className="mission-number-item">
                  <div className="number">2000+</div>
                  <span>Participant</span>
                </div>
                <div className="mission-number-item">
                  <div className="number">42.4km</div>
                  <span>run distance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Us */}
      <section className="s-choose-us" style={{backgroundImage: 'url(/img/bg-1.svg)'}}>
        <div className="container">
          <h2 className="title"><span>Reasons to run with us!</span></h2>
          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg-3 choose-us-item">
              <img src="/img/icon-1.svg" alt="quick registration" />
              <h4>Quick registration</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing</p>
            </div>
            <div className="col-sm-6 col-md-6 col-lg-3 choose-us-item">
              <img src="/img/icon-2.svg" alt="delivery" />
              <h4>Delivery to the venue</h4>
              <p>Voluptatibus molestiae aperiam ducimus, architecto</p>
            </div>
            <div className="col-sm-6 col-md-6 col-lg-3 choose-us-item">
              <img src="/img/icon-3.svg" alt="water" />
              <h4>Water for participants</h4>
              <p>cumque odio dolorum expedita ea illo sit laboriosam</p>
            </div>
            <div className="col-sm-6 col-md-6 col-lg-3 choose-us-item">
              <img src="/img/icon-4.svg" alt="medical" />
              <h4>Medical staff</h4>
              <p>Consectetur adipiscing elit, sed eiusmod tempor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Schedule */}
      <section id="schedule" className="s-event-schedule">
        <div className="container">
          <h2 className="title"><span>Event schedule</span></h2>
          <img className="schedule-effect-white" src="/img/tringle-white.svg" alt="effect" />
          <img className="schedule-effect-yellow" src="/img/tringle-yellow-little.svg" alt="effect" />
          <div className="row">
            <div className="col-xl-6">
              <div className="event-schedule-tabs">
                {scheduleItems.map((item) => (
                  <div key={item.id} className="event-schedule-item">
                    <div className="schedule-item-img">
                      <img src={item.icon} alt="schedule icon" />
                    </div>
                    <div className="schedule-item-info">
                      <div className="date">{item.time}</div>
                      <h4>{item.title}</h4>
                      <div className="schedule-info-content" style={{display: 'block'}}>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-6 event-schedule-img">
              <div className="schedule-img-wrap">
                <img className="schedule-effect-tringle" src="/img/tringle-gray-little.svg" alt="effect" />
                <img className="schedule-img-effect" src="/img/our-mission-2.svg" alt="effect" />
                <img className="schedule-img" src="/img/event-schedule.jpg" alt="event schedule" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map with Route */}
      <section id="location" className="map-with-route">
        <div className="container">
          <h2 className="title"><span>Map with route</span></h2>
          <div className="row">
            <div className="col-lg-6 map-route-img">
              <span>
                <img src="/img/our-mission-2.svg" alt="effect" className="map-img-effect-1" />
                <img src="/img/tringle-gray-little.svg" alt="effect" className="map-img-effect-2" />
                <img className="map-img" src="/img/map.png" alt="marathon route map" />
              </span>
            </div>
            <div className="col-lg-6 map-route-info">
              <div className="map-route-cover">
                <h4>There are many variations of passages of Lorem Ipsum available</h4>
                <div className="route-info-content">
                  <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas. At vero eos et accusamus et iusto.</p>
                </div>
                <div className="mission-number-cover">
                  <div className="mission-number-item">
                    <img src="/img/map-effect.svg" alt="effect" className="map-img-effect" />
                    <div className="number">42,4km</div>
                    <span>Run distance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="s-marathon-register">
        <img src="/img/tringle-gray-little.svg" alt="effect" className="register-img-effect-2" />
        <div className="container">
          <div className="marathon-register-row">
            <img src="/img/register-img.png" alt="registration" className="register-img" />
            <div className="marathon-register">
              <img src="/img/our-mission-2.svg" alt="effect" className="register-img-effect-1" />
              <h2 className="title"><span>Register form</span></h2>
              <form onSubmit={handleRegistrationSubmit}>
                <ul className="form-cover">
                  <li className="inp-cover inp-name">
                    <input 
                      type="text" 
                      placeholder="Name"
                      value={registrationForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </li>
                  <li className="inp-cover inp-email">
                    <input 
                      type="email" 
                      placeholder="E-mail"
                      value={registrationForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </li>
                  <li className="inp-cover inp-age">
                    <select 
                      value={registrationForm.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      required
                    >
                      <option value="" disabled>Age</option>
                      <option value="18-25">18 - 25</option>
                      <option value="26-30">26 - 30</option>
                      <option value="31-35">31 - 35</option>
                      <option value="36-40">36 - 40</option>
                      <option value="41+">41+</option>
                    </select>
                  </li>
                  <li className="inp-cover inp-gender">
                    <select 
                      value={registrationForm.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      required
                    >
                      <option value="" disabled>Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </li>
                  <li className="inp-text">
                    <textarea 
                      placeholder="Message"
                      value={registrationForm.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                    />
                  </li>
                </ul>
                <div className="checkbox-wrap">
                  <div className="checkbox-cover">
                    <input 
                      type="checkbox"
                      checked={registrationForm.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      required
                    />
                    <p>By using this form you agree with the storage and handling of your data by this website.</p>
                  </div>
                </div>
                <div className="btn-form-cover">
                  <button type="submit" className="btn"><span>Register</span></button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="s-clients">
        <div className="container">
          <h2 className="title"><span>Sponsors</span></h2>
          <div className="clients-cover">
            {[1, 2, 4, 5, 6].map((num) => (
              <div key={num} className="client-slide">
                <div className="client-slide-cover">
                  <img src={`/img/client-${num}.svg`} alt="sponsor" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marathon News */}
      <section id="news" className="s-marathon-news">
        <div className="container">
          <h2 className="title"><span>Our news</span></h2>
          <div className="marathon-news-slider">
            {newsItems.map((news) => (
              <div key={news.id} className="marathon-news-slide">
                <div className="marathon-news-date">
                  <span>{news.month}</span>{news.date}
                </div>
                <div className="marathon-news-item">
                  <h5><a href="/blog/single">{news.title}</a></h5>
                  <div className="marathon-post-thumbnail">
                    <a href="/blog/single">
                      <img src={news.thumbnail} alt="news" />
                    </a>
                  </div>
                  <div className="marathon-post-content">
                    <p>{news.content}</p>
                    <div className="marathon-post-meta">
                      <i className="fas fa-comment rxta-dynamic-meta-icon" aria-hidden="true"></i>
                      <a href="/blog">{news.comments} Comment(s)</a>
                    </div>
                    <a href="/blog/single" className="btn"><span>Read More</span></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="s-instagram">
        <div className="instagram-cover">
          {Array.from({length: 10}, (_, i) => (
            <a key={i + 1} href="#" className="instagram-item">
              <ul>
                <li className="comments">{Math.floor(Math.random() * 300) + 100} <i className="far fa-comment"></i></li>
                <li className="like">{Math.floor(Math.random() * 200) + 100} <i className="far fa-heart"></i></li>
              </ul>
              <img src={`/img/instagram-${i + 1}.jpg`} alt="instagram post" />
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="row">
            <div className="footer-cont col-12 col-sm-6 col-lg-4">
              <a href="/" className="logo">
                <img src="/img/logo.svg" alt="logo" />
              </a>
              <p>7100 Athens Place Washington, DC 20521</p>
              <ul className="footer-contacts">
                <li className="footer-phone">
                  <i className="fas fa-phone"></i>
                  <a href="tel:+18001234567">1-800-1234-567</a>
                </li>
                <li className="footer-email">
                  <a href="mailto:rovadex@gmail.com">rovadex@gmail.com</a>
                </li>
              </ul>
              <div className="footer-copyright">
                <a target="_blank" href="https://rovadex.com">Rovadex</a> © 2019. All Rights Reserved.
              </div>
            </div>
            <div className="footer-item-link col-12 col-sm-6 col-lg-4">
              <div className="footer-link">
                <h5>Event</h5>
                <ul className="footer-list">
                  <li><a href="#about">About</a></li>
                  <li><a href="#news">News</a></li>
                  <li><a href="#schedule">Key figures</a></li>
                  <li><a href="#schedule">Runners' Photos</a></li>
                  <li><a href="#schedule">Results</a></li>
                  <li><a href="#schedule">Partners</a></li>
                </ul>
              </div>
              <div className="footer-link">
                <h5>Social</h5>
                <ul className="footer-list">
                  <li><a target="_blank" href="https://www.facebook.com/rovadex">Facebook</a></li>
                  <li><a target="_blank" href="https://twitter.com/RovadexStudio">Twitter</a></li>
                  <li><a target="_blank" href="https://www.instagram.com/rovadex">Instagram</a></li>
                  <li><a target="_blank" href="https://www.youtube.com">Youtube</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-subscribe col-12 col-sm-6 col-lg-4">
              <h5>Subscribe to our newsletter. Stay up to date with our latest news and updates.</h5>
              <form className="subscribe-form" onSubmit={handleNewsletterSubmit}>
                <input 
                  className="inp-form" 
                  type="email" 
                  placeholder="E-mail"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button className="btn-form" type="submit">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
              <p>
                By clicking the button you agree to the{' '}
                <a href="#" target="_blank">Privacy Policy</a> and{' '}
                <a href="#" target="_blank">Terms and Conditions</a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* To Top Button */}
      <a className="to-top" href="#home">
        <i className="fa fa-angle-double-up" aria-hidden="true"></i>
      </a>
    </div>
  );
};

export default MarathonLanding;
