import { ChangeEvent, ChangeEventHandler, useState } from 'react';

import { Input } from '../Input';
import { Button } from '../Button';
import { Container, Text } from './styles';

export function Main() {
  function selectZip() {
    window.Main.selectZip(requestUrl);
  }

  function handleRequestUrl(event: ChangeEvent<HTMLInputElement>) {
    setRequestUrl(event.target.value); 
  }

  function generateJson() {
    window.Main.generateJson();
  }
  
  const [requestUrl, setRequestUrl] = useState('');

  return (
    <Container>
      <Text>3D VISTA HTML SECURITY TOOL</Text>
      <Input id='request-url' onChange={handleRequestUrl} placeholder='REQUEST URL'/>
      <Button onClick={selectZip}>SELECT ZIP</Button>
      <Button onClick={generateJson}>GENERATE JSON</Button>
    </Container>
  );
}
 
