from typing import TypedDict, Optional, Annotated, List
from langchain_core.messages import BaseMessage
import operator

class PatientState(TypedDict):
    # 'messages' will hold the history, we use operator.add to append
    messages: Annotated[List[BaseMessage], operator.add]
    
    patient_name: Optional[str]
    patient_age: Optional[int]
    patient_query: str
    ward: Optional[str]
    is_complete: bool
    message: Optional[str]
