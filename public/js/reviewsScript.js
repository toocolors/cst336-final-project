async function loadReviews() {
    const list = document.querySelector('#reviewsList');

    const res = await fetch(`/api/reviews/${GAME_ID}`);
    const reviews = await res.json();

    list.innerHTML = '';

    if (reviews.length === 0) {
        list.innerHTML = '<p>No reviews yet.</p>';
        return;
    }

    reviews.forEach(r => {
        list.innerHTML += `
            <div class="review-item">
                <div class="review-header">
                    <span class="username">${r.username}</span>
                    <span class="rating">${r.rating}/10</span>
                </div>

                <p class="review-text">${r.review_text}</p>

                <small>${new Date(r.created_at).toLocaleString()}</small>
            </div>
        `;
    });
}

loadReviews();
