import React, { useState } from 'react';

// TypeScript interfaces
interface Comment {
  id: string;
  name: string;
  date: string;
  comment: string;
  avatar: string;
  replies?: Comment[];
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  tag: string;
  thumbnail: string;
  content: string;
}

interface SingleBlogProps {
  post?: BlogPost;
}

const SingleBlog: React.FC<SingleBlogProps> = ({ post }) => {
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    message: '',
    agreeToTerms: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Default blog post data
  const defaultPost: BlogPost = {
    id: '1',
    title: 'Od tempor incididunt ut labore aliqua',
    author: 'Samson Peters',
    date: 'Dec 26, 2019',
    tag: 'Coaching',
    thumbnail: '/assets/img/post-3.jpg',
    content: `Cras pulvinar mattis nunc sed blandit libero volutpat. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Amet consectetur adipiscing elit pellentesque. Ultricies tristique nulla aliquet enim tortor.

Ultricies tristique nulla aliquet enim tortor. Arcu bibendum at varius vel pharetra vel turpis nunc eget. Et leo duis ut diam quam nulla. Cras pulvinar mattis nunc sed blandit libero volutpat. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Amet consectetur adipiscing elit pellentesque.

Non odio euismod lacinia at quis. Auctor augue mauris augue neque gravida. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar. In tellus integer feugiat scelerisque varius morbi enim. Fringilla ut morbi tincidunt augue interdum velit. Est velit egestas dui id ornare arcu odio. Amet mattis vulputate enim nulla aliquet porttitor lacus luctus accumsan. Vel elit scelerisque mauris pellentesque pulvinar pellentesque. Amet massa vitae tortor condimentum lacinia quis vel. Ut tellus elementum sagittis vitae et`
  };

  const blogPost = post || defaultPost;

  const comments: Comment[] = [
    {
      id: '1',
      name: 'Ella Bryan',
      date: 'Dec 26, 2019',
      comment: 'Non odio euismod lacinia at quis. Auctor augue mauris augue neque gravida. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar. In tellus integer feugiat scelerisque varius morbi enim.',
      avatar: '/assets/img/comments-photo-1.png',
      replies: [
        {
          id: '2',
          name: 'Richard Spencer',
          date: 'Dec 27, 2019',
          comment: 'Non odio euismod lacinia at quis. Auctor augue mauris augue neque gravida. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar. In tellus integer feugiat scelerisque varius morbi enim.',
          avatar: '/assets/img/comments-photo-2.png'
        }
      ]
    }
  ];

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Comment submitted:', commentForm);
    // Handle comment submission logic here
    setCommentForm({ name: '', email: '', message: '', agreeToTerms: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // Handle search logic here
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', newsletterEmail);
    // Handle newsletter subscription logic here
    setNewsletterEmail('');
  };

  const renderComment = (comment: Comment) => (
    <li key={comment.id} className="item">
      <div className="review-item">
        <div className="review-avatar">
          <img src={comment.avatar} alt="avatar" />
        </div>
        <div className="review-content">
          <h6 className="name">{comment.name}</h6>
          <div className="date">
            <i className="fas fa-calendar-alt" aria-hidden="true"></i>
            {comment.date}
          </div>
          <p className="review-comment">{comment.comment}</p>
          <a href="#" className="review-btn">
            <i className="fa fa-reply" aria-hidden="true"></i> Reply
          </a>
        </div>
      </div>
      {comment.replies && (
        <ul className="child">
          {comment.replies.map(reply => renderComment(reply))}
        </ul>
      )}
    </li>
  );

  return (
    <div className="single-blog-page">
      {/* Preloader */}
      <div className="page-preloader-cover">
        <div className="cssload-loader">
          <div className="cssload-inner cssload-one"></div>
          <div className="cssload-inner cssload-two"></div>
          <div className="cssload-inner cssload-three"></div>
        </div>
      </div>

      {/* Header */}
      <header>
        <a href="#" className="nav-btn">
          <span></span>
          <span></span>
          <span></span>
        </a>
        <div className="top-panel">
          <div className="container">
            <a href="/" className="logo">
              <img src="/assets/img/logo.svg" alt="logo" />
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
              <nav className="nav-menu">
                <ul className="nav-list">
                  <li className="dropdown">
                    <a href="#">home <i className="fa fa-angle-down" aria-hidden="true"></i></a>
                    <ul>
                      <li><a href="/">Home Marathon</a></li>
                      <li><a href="/conference">Home Conference</a></li>
                      <li><a href="/dance">Home Dance</a></li>
                    </ul>
                  </li>
                  <li><a href="/#about">about us</a></li>
                  <li><a href="/#schedule">schedule</a></li>
                  <li><a href="/#location">location</a></li>
                  <li><a href="/#register">register</a></li>
                  <li><a href="/#news">news</a></li>
                  <li className="dropdown active-page">
                    <a href="#">pages <i className="fa fa-angle-down" aria-hidden="true"></i></a>
                    <ul>
                      <li><a href="/conference-team">Conference Team</a></li>
                      <li><a href="/dance-team">Dance Team</a></li>
                      <li className="active-page"><a href="/blog">Blog</a></li>
                      <li><a href="/404">Page Error 404</a></li>
                    </ul>
                  </li>
                </ul>
              </nav>
              <a href="/#register" className="btn"><span>registration</span></a>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="page-title" style={{backgroundImage: 'url(/assets/img/bg-header.jpg)'}}>
        <div className="container">
          <div className="breadcrumbs">
            <ul>
              <li><a href="/">Home</a></li>
              <li>Blog</li>
            </ul>
          </div>
          <h1 className="title">Blog</h1>
        </div>
      </div>

      {/* Main Content */}
      <section className="s-news s-single-news">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-8 blog-cover">
              <div className="post-item-cover">
                <div className="post-header">
                  <h2 className="title">
                    <a href="/blog/single">{blogPost.title}</a>
                  </h2>
                  <div className="meta">
                    <span className="post-by">
                      <i className="fa fa-user" aria-hidden="true"></i>
                      By <a href="#">{blogPost.author}</a>
                    </span>
                    <span className="post-date">
                      <i className="fas fa-calendar-alt" aria-hidden="true"></i>
                      <a href="#">{blogPost.date}</a>
                    </span>
                    <span className="post-tag">
                      <i className="fas fa-tag" aria-hidden="true"></i>
                      <a href="#">{blogPost.tag}</a>
                    </span>
                  </div>
                  <div className="post-thumbnail">
                    <a href="/blog/single">
                      <img src={blogPost.thumbnail} alt="blog post" />
                    </a>
                  </div>
                </div>
                <div className="post-content">
                  <div className="text">
                    {blogPost.content.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                    <blockquote>
                      <p>Arcu bibendum at varius vel pharetra vel turpis nunc eget. Et leo duis ut diam quam nulla. Cras pulvinar mattis nunc sed blandit libero volutpat. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Amet consectetur adipiscing elit pellentesque.</p>
                      <cite>By <a href="#">Kerry Ashman</a></cite>
                    </blockquote>
                  </div>
                </div>
              </div>

              {/* Author Cover */}
              <div className="autor-cover">
                <img src="/assets/img/autor-img.png" alt="author" />
                <div className="autor-content">
                  <div className="name">{blogPost.author}</div>
                  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="navigation">
                <a href="#" className="navigation-item navigation-left">
                  <span>previous</span>
                  <div className="title">Sed ut perspiciatis unde</div>
                </a>
                <a href="#" className="navigation-item navigation-right">
                  <span>next</span>
                  <div className="title">Sed ut perspiciatis unde</div>
                </a>
              </div>

              {/* Comments Section */}
              <div className="reviews">
                <h2 className="title">Comments</h2>
                <ul className="reviews-list">
                  {comments.map(comment => renderComment(comment))}
                </ul>

                {/* Comment Form */}
                <div className="reviews-form">
                  <h2 className="title">Leave a Comment</h2>
                  <form onSubmit={handleCommentSubmit}>
                    <ul className="form-cover">
                      <li className="inp-name">
                        <input 
                          type="text" 
                          name="name" 
                          placeholder="Name"
                          value={commentForm.name}
                          onChange={(e) => setCommentForm({...commentForm, name: e.target.value})}
                          required
                        />
                      </li>
                      <li className="inp-email">
                        <input 
                          type="email" 
                          name="email" 
                          placeholder="E-mail"
                          value={commentForm.email}
                          onChange={(e) => setCommentForm({...commentForm, email: e.target.value})}
                          required
                        />
                      </li>
                      <li className="inp-text">
                        <textarea 
                          name="message" 
                          placeholder="Message"
                          value={commentForm.message}
                          onChange={(e) => setCommentForm({...commentForm, message: e.target.value})}
                          required
                        />
                      </li>
                    </ul>
                    <div className="checkbox-wrap">
                      <div className="checkbox-cover">
                        <input 
                          type="checkbox"
                          checked={commentForm.agreeToTerms}
                          onChange={(e) => setCommentForm({...commentForm, agreeToTerms: e.target.checked})}
                          required
                        />
                        <p>By using this form you agree with the storage and handling of your data by this website.</p>
                      </div>
                    </div>
                    <div className="btn-form-cover">
                      <button type="submit" className="btn">send comment</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-12 col-lg-4 sidebar">
              <ul className="widgets">
                {/* Search Widget */}
                <li className="widget widget-search">
                  <h4 className="title">search</h4>
                  <form onSubmit={handleSearch} className="search-form">
                    <input 
                      type="text" 
                      name="search" 
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="search-button" type="submit">
                      <i className="fa fa-search" aria-hidden="true"></i>
                    </button>
                  </form>
                </li>

                {/* Archive Widget */}
                <li className="widget widget-archive">
                  <h4 className="title">archive</h4>
                  <ul>
                    <li><a href="#">January 2019</a></li>
                    <li><a href="#">February 2019</a></li>
                    <li><a href="#">March 2019</a></li>
                    <li><a href="#">April 2019</a></li>
                    <li><a href="#">May 2019</a></li>
                  </ul>
                </li>

                {/* Tags Widget */}
                <li className="widget widget-tags">
                  <h5 className="title">Tags</h5>
                  <ul>
                    <li><a href="#">Loremiipsum</a></li>
                    <li><a href="#">Lorem</a></li>
                    <li><a href="#">Sitiamet</a></li>
                    <li><a href="#">Dolor</a></li>
                    <li><a href="#">Lorem</a></li>
                    <li><a href="#">Loremiipsum</a></li>
                    <li><a href="#">Dolor</a></li>
                    <li><a href="#">Sitiamet</a></li>
                  </ul>
                </li>

                {/* Categories Widget */}
                <li className="widget widget-categories">
                  <h4 className="title">categories</h4>
                  <ul>
                    <li><a href="#">Training</a></li>
                    <li><a href="#">Courses</a></li>
                    <li><a href="#">Conferences</a></li>
                    <li><a href="#">Development</a></li>
                    <li><a href="#">UI/UX Designer</a></li>
                  </ul>
                </li>

                {/* Recent Posts Widget */}
                <li className="widget widget-recent-posts">
                  <h4 className="title">recent blog posts</h4>
                  <ul>
                    <li>
                      <a href="#">Mobile App Design: From Beginner to Intermediate</a>
                      <div className="date">
                        <i className="fas fa-calendar-alt" aria-hidden="true"></i>
                        Dec 27, 2019 at 5:47 pm
                      </div>
                    </li>
                    <li>
                      <a href="#">Et harum quidem rerum facilis est et expedita distinctio</a>
                      <div className="date">
                        <i className="fas fa-calendar-alt" aria-hidden="true"></i>
                        Dec 17, 2018 at 5:47 pm
                      </div>
                    </li>
                    <li>
                      <a href="#">Nam libero tempore, cum soluta nobis est eligendi optio</a>
                      <div className="date">
                        <i className="fas fa-calendar-alt" aria-hidden="true"></i>
                        Dec 8, 2018 at 5:47 pm
                      </div>
                    </li>
                  </ul>
                </li>

                {/* Gallery Widget */}
                <li className="widget widget-instagram">
                  <h4 className="title">Gallery</h4>
                  <ul>
                    <li><a href="#"><img src="/assets/img/instagram-5.jpg" alt="gallery" /></a></li>
                    <li><a href="#"><img src="/assets/img/instagram-7.jpg" alt="gallery" /></a></li>
                    <li><a href="#"><img src="/assets/img/instagram-6.jpg" alt="gallery" /></a></li>
                    <li><a href="#"><img src="/assets/img/instagram-1.jpg" alt="gallery" /></a></li>
                    <li><a href="#"><img src="/assets/img/instagram-9.jpg" alt="gallery" /></a></li>
                    <li><a href="#"><img src="/assets/img/instagram-2.jpg" alt="gallery" /></a></li>
                  </ul>
                </li>

                {/* Newsletter Widget */}
                <li className="widget widget-newsletter">
                  <h4 className="title">newsletter</h4>
                  <form onSubmit={handleNewsletterSubmit} className="subscribe-form">
                    <input 
                      type="email" 
                      name="subscribe" 
                      placeholder="E-mail"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                    />
                    <button className="search-button" type="submit">
                      <i className="fa fa-paper-plane" aria-hidden="true"></i>
                    </button>
                  </form>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="row">
            <div className="footer-cont col-12 col-sm-6 col-lg-4">
              <a href="/" className="logo">
                <img src="/assets/img/logo.svg" alt="logo" />
              </a>
              <p>7100 Athens Place Washington, DC 20521</p>
              <ul className="footer-contacts">
                <li className="footer-phone">
                  <i aria-hidden="true" className="fas fa-phone"></i>
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
                  <li><a href="/#about">About</a></li>
                  <li><a href="/#news">News</a></li>
                  <li><a href="/#schedule">Key figures</a></li>
                  <li><a href="/#schedule">Runners' Photos</a></li>
                  <li><a href="/#schedule">Results</a></li>
                  <li><a href="/#schedule">Partners</a></li>
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
                  name="subscribe" 
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

export default SingleBlog;
