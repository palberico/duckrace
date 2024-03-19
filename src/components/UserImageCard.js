import React from 'react';
import { Card, Image } from 'semantic-ui-react';

const UserImageCard = ({ imageUrl, caption }) => {
  return (
    <Card>
      <Image src={imageUrl} wrapped ui={false} />
      {/* <Card.Content>
        {caption && <Card.Description>{caption}</Card.Description>}
      </Card.Content> */}
    </Card>
  );
};

export default UserImageCard;
