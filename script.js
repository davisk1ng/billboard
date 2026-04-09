const defaultConfig = {
  siteTitle: "Public Noticeboard",
  subtitle: "A shared poster wall for announcements, images, and community updates.",
  arenaChannel: "",
  maxItems: 12,
  introNote: "Add posters and announcements to the shared Are.na channel.",
  fallbackPosts: []
};

const settings = {
  ...defaultConfig,
  ...(window.BILLBOARD_CONFIG || {})
};

const titleEl = document.querySelector("#site-title");
const subtitleEl = document.querySelector("#site-subtitle");
const statusEl = document.querySelector("#board-status");
const lastUpdatedEl = document.querySelector("#last-updated");
const gridEl = document.querySelector("#billboard-grid");
const channelLinkEl = document.querySelector("#channel-link");
const template = document.querySelector("#card-template");

initBoard();

async function initBoard() {
  titleEl.textContent = settings.siteTitle;
  subtitleEl.textContent = settings.subtitle;

  if (hasRealChannel(settings.arenaChannel)) {
    channelLinkEl.href = `https://www.are.na/channel/${settings.arenaChannel}`;
    channelLinkEl.removeAttribute("aria-disabled");
  } else {
    channelLinkEl.href = "https://www.are.na/";
  }

  if (!hasRealChannel(settings.arenaChannel)) {
    setStatus("Showing sample posters. Add your Are.na channel slug in config.js to go live.");
    renderPosts(settings.fallbackPosts, true);
    return;
  }

  try {
    setStatus("Loading live Are.na posts…");
    const posts = await fetchArenaPosts(settings.arenaChannel, settings.maxItems);

    if (!posts.length) {
      throw new Error("No usable posts found in the channel.");
    }

    renderPosts(posts, false);
    setStatus(`Live from Are.na: ${settings.arenaChannel}`);
    lastUpdatedEl.textContent = `Updated ${new Date().toLocaleString()}`;
  } catch (error) {
    console.error(error);
    setStatus("Could not load the Are.na channel. Showing sample posters instead.");
    renderPosts(settings.fallbackPosts, true);
  }
}

function hasRealChannel(value) {
  return Boolean(value) && !String(value).includes("your-arena-channel-slug");
}

function setStatus(message) {
  statusEl.textContent = message;
}

async function fetchArenaPosts(channelSlug, maxItems) {
  const response = await fetch(`https://api.are.na/v2/channels/${encodeURIComponent(channelSlug)}?per=${maxItems}&sort=position&direction=desc`);

  if (!response.ok) {
    throw new Error(`Are.na request failed with ${response.status}`);
  }

  const data = await response.json();
  const contents = Array.isArray(data.contents) ? data.contents : [];

  return contents
    .map(mapArenaBlock)
    .filter((item) => item.title || item.description || item.image)
    .slice(0, maxItems);
}

function mapArenaBlock(block) {
  const title = block.title || block.generated_title || "Untitled post";
  const description =
    block.description ||
    block.content ||
    block.generated_description ||
    settings.introNote;

  const image =
    block.image?.display?.url ||
    block.image?.large?.url ||
    block.image?.thumb?.url ||
    null;

  const href =
    block.source?.url ||
    block.attachment?.url ||
    block.image?.original?.url ||
    `https://www.are.na/block/${block.id}`;

  return {
    title,
    description: trimText(description, 140),
    image,
    href,
    type: block.class || "Post"
  };
}

function renderPosts(posts, isFallback) {
  gridEl.innerHTML = "";

  if (!Array.isArray(posts) || posts.length === 0) {
    gridEl.innerHTML = `
      <div class="empty-state">
        <strong>No posts yet.</strong><br />
        Add a few posters or announcements to your Are.na channel to populate the board.
      </div>
    `;
    lastUpdatedEl.textContent = isFallback ? "Sample content ready" : "No posts found";
    return;
  }

  posts.forEach((post) => {
    const fragment = template.content.cloneNode(true);
    const imageEl = fragment.querySelector(".card-image");
    const placeholderEl = fragment.querySelector(".card-placeholder");
    const typeEl = fragment.querySelector(".card-type");
    const titleEl = fragment.querySelector(".card-title");
    const descriptionEl = fragment.querySelector(".card-description");
    const linkEl = fragment.querySelector(".card-link");

    typeEl.textContent = post.type || "Post";
    titleEl.textContent = post.title || "Untitled post";
    descriptionEl.textContent = post.description || settings.introNote;
    linkEl.href = post.href || "https://www.are.na/";

    if (post.image) {
      imageEl.src = post.image;
      imageEl.alt = post.title || "Billboard poster";
      placeholderEl.hidden = true;
    } else {
      imageEl.remove();
      placeholderEl.hidden = false;
    }

    gridEl.appendChild(fragment);
  });

  if (isFallback) {
    lastUpdatedEl.textContent = "Sample content ready";
  }
}

function trimText(text, maxLength) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}
