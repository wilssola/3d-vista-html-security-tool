import styled from 'styled-components';

export const Container = styled.input`
  height: 32px;
  padding: 0 24px;
  margin-top: 24px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  background: #7050e1;
  border-radius: 8px;
  border: 0;

  color: #F7F6FF;
  font-size: 16px;

  cursor: pointer;

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.7);
  }
`;
