import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  useToast,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import meetingService from "services/meetingService";
import { useNavigate } from "react-router-dom";
import Card from "components/card/Card";
import { HasAccess } from "../../../redux/accessUtils";
import { getApi } from "services/api";

export default function Meeting() {
  const textColor = useColorModeValue("gray.700", "white");
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  
  // Get access permissions
  const [permission] = HasAccess(['Meetings']);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      // Use the API pattern that's working in other places in your app
      const response = await getApi('api/meeting');
      if (response && response.data) {
        setMeetings(response.data);
      } else {
        setMeetings([]);
      }
    } catch (error) {
      toast({
        title: "Error fetching meetings",
        description: error.message || "Failed to load meetings",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id) => {
    navigate(`/metting/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/meeting/edit/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await meetingService.deleteMeeting(id);
      toast({
        title: "Meeting deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchMeetings();
    } catch (error) {
      toast({
        title: "Error deleting meeting",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex
          align={{ sm: "flex-start", lg: "center" }}
          justify="space-between"
          w="100%"
          px="22px"
          py="18px"
        >
          <Text color={textColor} fontSize="xl" fontWeight="600">
            Meetings
          </Text>
          {permission?.create && (
            <Button
              variant="primary"
              leftIcon={<AddIcon />}
              onClick={() => navigate("/meeting/add")}
            >
              Add Meeting
            </Button>
          )}
        </Flex>

        {isLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner />
          </Box>
        ) : (
          <Box p={4}>
            {meetings && meetings.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Start Time</Th>
                      <Th>Location</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {meetings.map((meeting) => (
                      <Tr key={meeting._id}>
                        <Td>{meeting.title}</Td>
                        <Td>
                          {meeting.startTime ? new Date(meeting.startTime).toLocaleString() : "-"}
                        </Td>
                        <Td>
                          {meeting.location || "-"}
                        </Td>
                        <Td>
                          {meeting.meetingType || "in-person"}
                        </Td>
                        <Td>
                          {meeting.status || "scheduled"}
                        </Td>
                        <Td>
                          <Flex gap={2}>
                            <Button size="sm" onClick={() => handleView(meeting._id)}>
                              View
                            </Button>
                            {permission?.update && (
                              <Button size="sm" onClick={() => handleEdit(meeting._id)}>
                                Edit
                              </Button>
                            )}
                            {permission?.delete && (
                              <Button size="sm" colorScheme="red" onClick={() => handleDelete(meeting._id)}>
                                Delete
                              </Button>
                            )}
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                No meetings found
              </Box>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
} 