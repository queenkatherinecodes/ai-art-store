import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader, Loader2 } from 'lucide-react';

const Reviews = () => {
    const [review, setReview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReview = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/reviews/review');
            const data = await response.json();
            setReview(data);
        } catch (error) {
            console.error('Error fetching review:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReview();
    }, []);

    const handleNextReview = () => {
        fetchReview();
    };

    if (!review) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader2 className="animate-spin" size={240} />
        </div>;
    }

    return (
        <div className="reviews-container">
            <div className="hero reviews-hero">
                <h1>{review.name}</h1>
                <div className="star-rating">
                    {[...Array(5)].map((_, index) => (
                        <span key={index} className={index < review.stars ? 'star filled' : 'star'}>
                            ★
                        </span>
                    ))}
                </div>
                <p className="review-quote">"{review.quote}"</p>
                <button className="next-review-button" onClick={handleNextReview} disabled={isLoading}>
                    {isLoading ? (
                        <Loader size={24} className="animate-spin" />
                    ) : (
                        <ChevronRight size={24} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Reviews;