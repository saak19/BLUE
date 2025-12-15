(function () {
    const API_URL = 'http://localhost:3001/api';
    const WS_URL = 'ws://localhost:8080';

    // Find the script tag and host ID
    const scriptTag = document.currentScript || document.querySelector('script[src*="embed.js"]');
    const hostId = scriptTag ? scriptTag.getAttribute('data-host-id') : null;

    if (!hostId) {
        console.warn('LiveConnect: No data-host-id found');
        return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'http://localhost:3001/embed/embed-styles.css'; // Assuming served statically or from same location logic
    // Fallback: Inline styles or assume user includes css. 
    // Ideally we inject styles here if we want single-script. for now assume hosted.
    document.head.appendChild(link);

    // Helper to fetch HTML template
    // Converting the HTML file content to string for "single file" feel in this env, 
    // or fetch it. Fetching is better for "hosted version".
    // Note: CORS might block fetching if not configured.
    // I will inject the HTML directly using innerHTML for robustness in this local simulation.

    const widgetHTML = `
  <div class="lc-widget minimized" id="lc-widget-root">
    <button class="lc-toggle-btn" id="lc-toggle" style="z-index:10001">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
    </button>
    <div class="lc-card" id="lc-card">
      <div class="lc-header">
        <div id="lc-avatar-placeholder" class="lc-avatar">U</div>
        <img id="lc-avatar" class="lc-avatar" style="display:none;" />
        <div class="lc-info">
          <h3 id="lc-name">Loading...</h3>
          <p id="lc-title"></p>
        </div>
        <div id="lc-status" class="lc-status-indicator" title="Offline"></div>
      </div>
      
      <div class="lc-body" id="lc-main-view">
        <p id="lc-bio" class="lc-bio"></p>
        <div class="lc-actions">
          <button id="lc-btn-request" class="lc-btn lc-btn-primary">Send Request</button>
          <button id="lc-btn-book" class="lc-btn lc-btn-secondary">Book Appointment</button>
        </div>
      </div>

      <div class="lc-body hidden" id="lc-request-view" style="display:none;">
        <button class="lc-back-btn" onclick="showView('lc-main-view')">&larr; Back</button>
        <div class="lc-form">
          <input type="text" id="lc-req-name" class="lc-input" placeholder="Your Name" />
          <input type="email" id="lc-req-email" class="lc-input" placeholder="Your Email" />
          <textarea id="lc-req-msg" class="lc-textarea" rows="3" placeholder="Message"></textarea>
          <button id="lc-submit-request" class="lc-btn lc-btn-primary">Send</button>
        </div>
      </div>

      <div class="lc-body hidden" id="lc-booking-view" style="display:none;">
        <button class="lc-back-btn" onclick="showView('lc-main-view')">&larr; Back</button>
        <p style="margin-bottom:8px; color:#6b7280; font-size:12px;">Select a slot:</p>
        <div id="lc-slots-list" class="lc-form"></div>
      </div>
    </div>
  </div>
  `;

    // Inject Styles (Inline fallback)
    const style = document.createElement('style');
    style.textContent = `
    .lc-widget { position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: sans-serif; }
    .lc-widget.minimized .lc-card { display: none; }
    .lc-toggle-btn { width: 60px; height: 60px; border-radius: 50%; background: #3b82f6; border:none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .lc-card { background: white; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 320px; margin-bottom: 70px; border: 1px solid #e5e7eb; overflow: hidden; position: absolute; bottom: 0; right: 0; }
    .lc-header { padding: 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; }
    .lc-avatar { width: 40px; height: 40px; border-radius: 50%; background: #e0e7ff; margin-right: 12px; display:flex; align-items:center; justify-content:center; color:#4f46e5; font-weight:bold;}
    .lc-info h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .lc-info p { margin: 0; font-size: 12px; color: #6b7280; }
    .lc-status-indicator { width: 10px; height: 10px; border-radius: 50%; background: #9ca3af; margin-left: auto; }
    .lc-status-indicator.online { background: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
    .lc-body { padding: 16px; }
    .lc-bio { font-size: 13px; color: #4b5563; margin-bottom: 16px; }
    .lc-actions { display: flex; flex-direction: column; gap: 8px; }
    .lc-btn { padding: 8px; border-radius: 6px; border: 1px solid transparent; font-size: 14px; cursor: pointer; background: #e5e7eb; width: 100%; transition: all 0.2s;}
    .lc-btn-primary { background: #3b82f6; color: white; }
    .lc-btn-primary:hover { background: #2563eb; }
    .lc-btn-secondary { background: white; border-color: #d1d5db; color: #374151; }
    .lc-input, .lc-textarea { width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box;} 
    .lc-back-btn { background:none; border:none; cursor:pointer; color:#6b7280; margin-bottom:8px; font-size:12px;}
  `;
    document.head.appendChild(style);

    // Inject HTML
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // State
    let isOpen = false;
    let socket = null;

    // DOM Elements
    const widgetRoot = document.getElementById('lc-widget-root');
    const toggleBtn = document.getElementById('lc-toggle');

    // Handlers
    window.showView = (viewId) => {
        ['lc-main-view', 'lc-request-view', 'lc-booking-view'].forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
        document.getElementById(viewId).style.display = 'block';
    };

    toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            widgetRoot.classList.remove('minimized');
        } else {
            widgetRoot.classList.add('minimized');
        }
    });

    document.getElementById('lc-btn-request').addEventListener('click', () => showView('lc-request-view'));
    document.getElementById('lc-btn-book').addEventListener('click', () => {
        showView('lc-booking-view');
        fetchSlots(); // Load slots when opening booking view
    });

    const fetchSlots = () => {
        fetch(`${API_URL}/availability/${hostId}/slots`)
            .then(res => res.json())
            .then(slots => {
                const list = document.getElementById('lc-slots-list');
                list.innerHTML = slots.map(slot => `
          <button class="lc-btn lc-btn-secondary" style="margin-bottom:4px; text-align:left;">
            <strong>${slot.dayOfWeek}</strong> ${slot.startTime} - ${slot.endTime}
          </button>
        `).join('') || '<p>No slots available</p>';
            });
    };

    document.getElementById('lc-submit-request').addEventListener('click', () => {
        const name = document.getElementById('lc-req-name').value;
        const email = document.getElementById('lc-req-email').value;
        const message = document.getElementById('lc-req-msg').value;

        fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hostId, visitorName: name, visitorEmail: email, message })
        }).then(res => {
            if (res.ok) alert('Request sent!');
            else alert('Error sending request');
        });
    });

    // Load Profile
    fetch(`${API_URL}/public/hosts/${hostId}`)
        .then(res => res.json())
        .then(profile => {
            if (profile.userId) {
                document.getElementById('lc-name').innerText = profile.userId.name;
                document.getElementById('lc-title').innerText = profile.title || '';
                document.getElementById('lc-bio').innerText = profile.bio || 'No bio.';
                if (profile.avatar) {
                    document.getElementById('lc-avatar').src = profile.avatar;
                    document.getElementById('lc-avatar').style.display = 'block';
                    document.getElementById('lc-avatar-placeholder').style.display = 'none';
                }
            }
        })
        .catch(err => console.error('Error loading profile', err));

    // WebSocket
    const connectWS = () => {
        socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'subscribe', hostId }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'status_update') {
                const indicator = document.getElementById('lc-status');
                if (data.status === 'online') {
                    indicator.classList.add('online');
                    indicator.title = 'Online';
                } else {
                    indicator.classList.remove('online');
                    indicator.title = 'Offline';
                }
            }
        };

        socket.onclose = () => {
            setTimeout(connectWS, 5000);
        };
    };

    connectWS();

})();
