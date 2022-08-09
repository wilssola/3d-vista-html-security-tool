import { Button } from '../Button'
import { Container, Text } from './styles'

export function Greetings() {
  function selectZip() {
    window.Main.selectZip();
  }

  return (
    <Container>
      <Text>3D VISTA HTML SECURITY TOOL</Text>
      <Button onClick={selectZip}>SELECT ZIP</Button>
    </Container>
  )
}
 
