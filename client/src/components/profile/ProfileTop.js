import React from 'react';
import PropTypes from 'prop-types';

const ProfileTop = ({
	profile: {
		status,
		company,
		location,
		website,
		social,
		user: { name, image }
	}
}) => {
	return (
		<div class='profile-top bg-primary p-2'>
			<img class='round-img my-1' src={image} alt='' />
			<h1 class='large'>{name}</h1>
			<p class='lead'>
				{status} {company && <span>at {company}</span>}
			</p>
			<p> {location && <span>{location}</span>}</p>
			<div class='icons my-1'>
				<a href='#' target='_blank' rel='noopener noreferrer'>
					<i class='fa fa-globe fa-2x'></i>
				</a>
				<a href='#' target='_blank' rel='noopener noreferrer'>
					<i class='fa fa-twitter fa-2x'></i>
				</a>
				<a href='#' target='_blank' rel='noopener noreferrer'>
					<i class='fa fa-facebook fa-2x'></i>
				</a>
				<a href='#' target='_blank' rel='noopener noreferrer'>
					<i class='fa fa-linkedin fa-2x'></i>
				</a>
				<a href='#' target='_blank' rel='noopener noreferrer'>
					<i class='fa fa-youtube fa-2x'></i>
				</a>
				<a href='#' target='_blank' rel='noopener noreferrer'>
					<i class='fa fa-instagram fa-2x'></i>
				</a>
			</div>
		</div>
	);
};

ProfileTop.propTypes = {
	profile: PropTypes.object.isRequired
};

export default ProfileTop;
