import styled from 'styled-components';

export const Container = styled.input`
  height: 32px;
  width: 80vw;
  padding: 0 24px;
  margin-top: 24px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  background: #8257e6;
  border-radius: 8px;
  border: 0;

  color: #FFF;
  font-size: 16px;

  cursor: pointer;

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.7);
  }
`;
