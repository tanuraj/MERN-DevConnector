import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProfileItem = ({
	profile: {
		user: { _id, name, image },
		status,
		company,
		location,
		skills
	}
}) => {
	return (
		<div className='profile bg-light'>
			<img src={image} alt='' className='round-img' />
			<div>
				<h2>{name}</h2>
				<p>
					{status} {company && <span>at {company}</span>}
				</p>
				<p className='my-1'>{Location && <span>{Location}</span>}</p>
				<Link to={`/profile/${_id}`} className='btn btn-primary'>
					View Profile
				</Link>
			</div>
			<ul>
				{skills.slice(0, 4).map((skill, index) => (
					<li key={index} className='text-primary'>
						<i className='fa fa-check'>{skill}</i>
					</li>
				))}
			</ul>
		</div>
	);
};

ProfileItem.propTypes = {
	profile: PropTypes.object.isRequired
};

export default ProfileItem;

// display profiles video no.2
